import { ContractStatus, UserRole } from '../enums/index.js';
import {
  canEditContract,
  canViewContract,
  hasPermission,
  isValidStatusTransition,
} from './index.js';

describe('contract permissions', () => {
  describe('isValidStatusTransition', () => {
    it('allows the approval workflow', () => {
      expect(isValidStatusTransition(ContractStatus.DRAFT, ContractStatus.IN_REVIEW)).toBe(true);
      expect(isValidStatusTransition(ContractStatus.IN_REVIEW, ContractStatus.APPROVED)).toBe(true);
      expect(isValidStatusTransition(ContractStatus.IN_REVIEW, ContractStatus.REJECTED)).toBe(true);
      expect(isValidStatusTransition(ContractStatus.REJECTED, ContractStatus.DRAFT)).toBe(true);
    });

    it('blocks skipping review and leaving an approved contract', () => {
      expect(isValidStatusTransition(ContractStatus.DRAFT, ContractStatus.APPROVED)).toBe(false);
      expect(isValidStatusTransition(ContractStatus.APPROVED, ContractStatus.DRAFT)).toBe(false);
      expect(isValidStatusTransition(ContractStatus.REJECTED, ContractStatus.APPROVED)).toBe(false);
    });
  });

  describe('canViewContract', () => {
    it('hides drafts from viewers', () => {
      expect(canViewContract(UserRole.VIEWER, ContractStatus.DRAFT)).toBe(false);
      expect(canViewContract(UserRole.VIEWER, ContractStatus.IN_REVIEW)).toBe(true);
      expect(canViewContract(UserRole.LEGAL, ContractStatus.DRAFT)).toBe(true);
      expect(canViewContract(UserRole.ADMIN, ContractStatus.DRAFT)).toBe(true);
    });
  });

  describe('canEditContract', () => {
    it('allows edits only on draft and rejected contracts', () => {
      expect(canEditContract(ContractStatus.DRAFT)).toBe(true);
      expect(canEditContract(ContractStatus.REJECTED)).toBe(true);
      expect(canEditContract(ContractStatus.IN_REVIEW)).toBe(false);
      expect(canEditContract(ContractStatus.APPROVED)).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('keeps user administration on the admin role', () => {
      expect(hasPermission(UserRole.ADMIN, 'user:delete')).toBe(true);
      expect(hasPermission(UserRole.LEGAL, 'user:delete')).toBe(false);
      expect(hasPermission(UserRole.VIEWER, 'contract:create')).toBe(false);
      expect(hasPermission(UserRole.LEGAL, 'contract:approve')).toBe(true);
    });
  });
});
