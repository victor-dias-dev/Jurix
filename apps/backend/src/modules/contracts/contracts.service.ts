import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { Contract, ContractVersion, User } from '../../models';
import { AuditService } from '../audit/audit.service';
import { CreateContractDto, UpdateContractDto, RejectContractDto } from './schemas';
import {
  ContractStatus,
  UserRole,
  AuditAction,
  EntityType,
  PaginatedResponse,
  ContractWithCreator,
  canViewContract,
  canEditContract,
  isValidStatusTransition,
} from '@jurix/shared-types';

interface FindAllOptions {
  page?: number;
  limit?: number;
  status?: ContractStatus;
  createdById?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class ContractsService {
  constructor(
    @InjectModel(Contract)
    private readonly contractModel: typeof Contract,
    @InjectModel(ContractVersion)
    private readonly contractVersionModel: typeof ContractVersion,
    private readonly sequelize: Sequelize,
    private readonly auditService: AuditService,
  ) {}

  async create(
    createContractDto: CreateContractDto,
    user: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Contract> {
    const transaction = await this.sequelize.transaction();

    try {
      const contract = await this.contractModel.create(
        {
          title: createContractDto.title,
          content: createContractDto.content,
          status: ContractStatus.DRAFT,
          createdById: user.id,
          currentVersion: 1,
        },
        { transaction },
      );

      await this.contractVersionModel.create(
        {
          contractId: contract.id,
          version: 1,
          title: contract.title,
          content: contract.content,
          status: ContractStatus.DRAFT,
          changedById: user.id,
          changeReason: 'Criação inicial',
        },
        { transaction },
      );

      await this.auditService.log({
        userId: user.id,
        action: AuditAction.CONTRACT_CREATED,
        entityType: EntityType.CONTRACT,
        entityId: contract.id,
        metadata: { title: contract.title },
        ipAddress,
        userAgent,
      });

      await transaction.commit();

      return contract;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async findAll(
    options: FindAllOptions,
    user: User,
  ): Promise<PaginatedResponse<ContractWithCreator>> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (user.role === UserRole.VIEWER) {
      where.status = { [Op.ne]: ContractStatus.DRAFT };
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.createdById) {
      where.createdById = options.createdById;
    }

    if (options.search) {
      where.title = { [Op.iLike]: `%${options.search}%` };
    }

    const sortBy = options.sortBy ?? 'createdAt';
    const sortOrder = options.sortOrder ?? 'desc';

    const { count, rows } = await this.contractModel.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
    });

    const data = rows.map((contract) => ({
      ...contract.toJSON(),
      createdBy: {
        id: contract.createdBy.id,
        name: contract.createdBy.name,
        email: contract.createdBy.email,
      },
    })) as ContractWithCreator[];

    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findById(id: string, user: User): Promise<Contract> {
    const contract = await this.contractModel.findByPk(id, {
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!contract) {
      throw new NotFoundException('Contrato não encontrado');
    }

    if (!canViewContract(user.role, contract.status)) {
      throw new ForbiddenException('Você não tem permissão para ver este contrato');
    }

    return contract;
  }

  async update(
    id: string,
    updateContractDto: UpdateContractDto,
    user: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Contract> {
    const contract = await this.findById(id, user);

    if (!canEditContract(contract.status)) {
      throw new ForbiddenException(
        `Contratos em status ${contract.status} não podem ser editados`,
      );
    }

    const transaction = await this.sequelize.transaction();

    try {
      const newVersion = contract.currentVersion + 1;

      await contract.update(
        {
          ...updateContractDto,
          currentVersion: newVersion,
        },
        { transaction },
      );

      await this.contractVersionModel.create(
        {
          contractId: contract.id,
          version: newVersion,
          title: contract.title,
          content: contract.content,
          status: contract.status,
          changedById: user.id,
          changeReason: 'Atualização de conteúdo',
        },
        { transaction },
      );

      await this.auditService.log({
        userId: user.id,
        action: AuditAction.CONTRACT_UPDATED,
        entityType: EntityType.CONTRACT,
        entityId: contract.id,
        metadata: { version: newVersion, changes: updateContractDto },
        ipAddress,
        userAgent,
      });

      await transaction.commit();

      return contract.reload();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async delete(
    id: string,
    user: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const contract = await this.findById(id, user);

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas administradores podem excluir contratos');
    }

    if (contract.status === ContractStatus.APPROVED) {
      throw new ForbiddenException('Contratos aprovados não podem ser excluídos');
    }

    await this.auditService.log({
      userId: user.id,
      action: AuditAction.CONTRACT_DELETED,
      entityType: EntityType.CONTRACT,
      entityId: contract.id,
      metadata: { title: contract.title, status: contract.status },
      ipAddress,
      userAgent,
    });

    await contract.destroy();
  }

  async submit(
    id: string,
    user: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Contract> {
    return this.changeStatus(
      id,
      ContractStatus.IN_REVIEW,
      user,
      'Enviado para revisão',
      AuditAction.CONTRACT_SUBMITTED,
      ipAddress,
      userAgent,
    );
  }

  async approve(
    id: string,
    user: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Contract> {
    return this.changeStatus(
      id,
      ContractStatus.APPROVED,
      user,
      'Contrato aprovado',
      AuditAction.CONTRACT_APPROVED,
      ipAddress,
      userAgent,
    );
  }

  async reject(
    id: string,
    rejectDto: RejectContractDto,
    user: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Contract> {
    return this.changeStatus(
      id,
      ContractStatus.REJECTED,
      user,
      rejectDto.reason,
      AuditAction.CONTRACT_REJECTED,
      ipAddress,
      userAgent,
    );
  }

  async returnToDraft(
    id: string,
    user: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Contract> {
    return this.changeStatus(
      id,
      ContractStatus.DRAFT,
      user,
      'Retornado para edição',
      AuditAction.CONTRACT_UPDATED,
      ipAddress,
      userAgent,
    );
  }

  private async changeStatus(
    id: string,
    newStatus: ContractStatus,
    user: User,
    reason: string,
    auditAction: AuditAction,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Contract> {
    const contract = await this.findById(id, user);

    if (!isValidStatusTransition(contract.status, newStatus)) {
      throw new BadRequestException(
        `Transição de ${contract.status} para ${newStatus} não é permitida`,
      );
    }

    const transaction = await this.sequelize.transaction();

    try {
      const newVersion = contract.currentVersion + 1;

      await contract.update(
        {
          status: newStatus,
          currentVersion: newVersion,
        },
        { transaction },
      );

      await this.contractVersionModel.create(
        {
          contractId: contract.id,
          version: newVersion,
          title: contract.title,
          content: contract.content,
          status: newStatus,
          changedById: user.id,
          changeReason: reason,
        },
        { transaction },
      );

      await this.auditService.log({
        userId: user.id,
        action: auditAction,
        entityType: EntityType.CONTRACT,
        entityId: contract.id,
        metadata: {
          previousStatus: contract.status,
          newStatus,
          reason,
          version: newVersion,
        },
        ipAddress,
        userAgent,
      });

      await transaction.commit();

      return contract.reload();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getVersions(id: string, user: User): Promise<ContractVersion[]> {
    await this.findById(id, user);

    return this.contractVersionModel.findAll({
      where: { contractId: id },
      include: [
        {
          model: User,
          as: 'changedBy',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['version', 'DESC']],
    });
  }
}
