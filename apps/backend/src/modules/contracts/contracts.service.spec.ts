import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  AuditAction,
  ContractStatus,
  UserRole,
} from '@jurix/shared-types';

import { ContractsService } from './contracts.service';
import { Contract, ContractVersion, User } from '../../models';
import { AuditService } from '../audit/audit.service';

describe('ContractsService', () => {
  let service: ContractsService;
  let contractModel: { create: jest.Mock; findAndCountAll: jest.Mock; findByPk: jest.Mock };
  let contractVersionModel: { create: jest.Mock };
  let transaction: { commit: jest.Mock; rollback: jest.Mock };
  let sequelize: { transaction: jest.Mock };
  let auditService: { log: jest.Mock };

  const legal = { id: 'legal-1', role: UserRole.LEGAL } as User;
  const viewer = { id: 'viewer-1', role: UserRole.VIEWER } as User;
  const admin = { id: 'admin-1', role: UserRole.ADMIN } as User;

  function buildContract(status: ContractStatus = ContractStatus.DRAFT) {
    const contract: {
      id: string;
      title: string;
      content: string;
      status: ContractStatus;
      currentVersion: number;
      createdBy: { id: string; name: string; email: string };
      update: jest.Mock;
      reload: jest.Mock;
      destroy: jest.Mock;
      toJSON: () => Record<string, unknown>;
    } = {
      id: 'contract-1',
      title: 'Acordo de confidencialidade',
      content: 'Conteúdo do contrato de teste.',
      status,
      currentVersion: 1,
      createdBy: { id: legal.id, name: 'Legal', email: 'legal@jurix.com' },
      update: jest.fn(async (values: Record<string, unknown>) => {
        Object.assign(contract, values);
        return contract;
      }),
      reload: jest.fn(async () => contract),
      destroy: jest.fn(async () => undefined),
      toJSON() {
        return {
          id: contract.id,
          title: contract.title,
          content: contract.content,
          status: contract.status,
          currentVersion: contract.currentVersion,
        };
      },
    };

    return contract;
  }

  beforeEach(() => {
    transaction = { commit: jest.fn(), rollback: jest.fn() };
    sequelize = { transaction: jest.fn().mockResolvedValue(transaction) };
    contractModel = {
      create: jest.fn(),
      findAndCountAll: jest.fn().mockResolvedValue({ count: 0, rows: [] }),
      findByPk: jest.fn(),
    };
    contractVersionModel = { create: jest.fn().mockResolvedValue({}) };
    auditService = { log: jest.fn().mockResolvedValue({}) };

    service = new ContractsService(
      contractModel as unknown as typeof Contract,
      contractVersionModel as unknown as typeof ContractVersion,
      sequelize as unknown as Sequelize,
      auditService as unknown as AuditService,
    );
  });

  it('creates a draft, a version and an audit row in one transaction', async () => {
    contractModel.create.mockImplementation(async (values: Record<string, unknown>) => ({
      id: 'contract-1',
      title: values.title,
      content: values.content,
      status: ContractStatus.DRAFT,
      currentVersion: 1,
    }));

    const created = await service.create(
      { title: 'Acordo de confidencialidade', content: 'Conteúdo do contrato de teste.' },
      legal,
    );

    expect(created.status).toBe(ContractStatus.DRAFT);
    expect(contractVersionModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ version: 1, changeReason: 'Criação inicial' }),
      { transaction },
    );
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: AuditAction.CONTRACT_CREATED }),
      transaction,
    );
    expect(transaction.commit).toHaveBeenCalled();
  });

  it('submits, approves, rejects and returns a contract to draft', async () => {
    const contract = buildContract(ContractStatus.DRAFT);
    contractModel.findByPk.mockResolvedValue(contract);

    await service.submit('contract-1', legal);
    expect(contract.status).toBe(ContractStatus.IN_REVIEW);
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.CONTRACT_SUBMITTED,
        metadata: expect.objectContaining({
          previousStatus: ContractStatus.DRAFT,
          newStatus: ContractStatus.IN_REVIEW,
        }),
      }),
      transaction,
    );

    await service.approve('contract-1', legal);
    expect(contract.status).toBe(ContractStatus.APPROVED);

    contract.status = ContractStatus.IN_REVIEW;
    await service.reject('contract-1', { reason: 'Cláusula de foro incompleta' }, legal);
    expect(contract.status).toBe(ContractStatus.REJECTED);

    await service.returnToDraft('contract-1', legal);
    expect(contract.status).toBe(ContractStatus.DRAFT);
    expect(contractVersionModel.create).toHaveBeenCalledWith(
      expect.anything(),
      { transaction },
    );
  });

  it('refuses to edit a contract that is in review', async () => {
    contractModel.findByPk.mockResolvedValue(buildContract(ContractStatus.IN_REVIEW));

    await expect(
      service.update('contract-1', { title: 'Título novo' }, legal),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(sequelize.transaction).not.toHaveBeenCalled();
  });

  it('refuses to approve a draft directly', async () => {
    contractModel.findByPk.mockResolvedValue(buildContract(ContractStatus.DRAFT));

    await expect(service.approve('contract-1', legal)).rejects.toBeInstanceOf(BadRequestException);
    expect(sequelize.transaction).not.toHaveBeenCalled();
  });

  it('hides drafts from a viewer, including an explicit draft filter', async () => {
    const hidden = await service.findAll({ status: ContractStatus.DRAFT }, viewer);

    expect(hidden.data).toEqual([]);
    expect(contractModel.findAndCountAll).not.toHaveBeenCalled();

    await service.findAll({}, viewer);

    expect(contractModel.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { [Op.ne]: ContractStatus.DRAFT },
        }),
      }),
    );

    await service.findAll({ status: ContractStatus.IN_REVIEW }, viewer);

    expect(contractModel.findAndCountAll).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: ContractStatus.IN_REVIEW,
        }),
      }),
    );
  });

  it('deletes a contract and writes the audit log in the same transaction', async () => {
    const contract = buildContract(ContractStatus.DRAFT);
    contractModel.findByPk.mockResolvedValue(contract);

    await expect(service.delete('contract-1', legal)).rejects.toBeInstanceOf(ForbiddenException);

    contract.status = ContractStatus.APPROVED;
    await expect(service.delete('contract-1', admin)).rejects.toBeInstanceOf(ForbiddenException);

    contract.status = ContractStatus.DRAFT;
    await service.delete('contract-1', admin);

    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: AuditAction.CONTRACT_DELETED }),
      transaction,
    );
    expect(contract.destroy).toHaveBeenCalledWith({ transaction });
    expect(transaction.commit).toHaveBeenCalled();
  });
});
