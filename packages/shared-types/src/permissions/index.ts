import { UserRole, ContractStatus } from '../enums/index.js';

export type Permission =
  | 'contract:create'
  | 'contract:read'
  | 'contract:update'
  | 'contract:delete'
  | 'contract:submit'
  | 'contract:approve'
  | 'contract:reject'
  | 'user:create'
  | 'user:read'
  | 'user:update'
  | 'user:delete'
  | 'audit:read';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    'contract:create',
    'contract:read',
    'contract:update',
    'contract:delete',
    'contract:submit',
    'contract:approve',
    'contract:reject',
    'user:create',
    'user:read',
    'user:update',
    'user:delete',
    'audit:read',
  ],
  [UserRole.LEGAL]: [
    'contract:create',
    'contract:read',
    'contract:update',
    'contract:submit',
    'contract:approve',
    'contract:reject',
    'audit:read',
  ],
  [UserRole.VIEWER]: [
    'contract:read',
    'audit:read',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canViewContract(role: UserRole, status: ContractStatus): boolean {
  if (status === ContractStatus.DRAFT) {
    return role === UserRole.ADMIN || role === UserRole.LEGAL;
  }
  return true;
}

export function canEditContract(status: ContractStatus): boolean {
  return status === ContractStatus.DRAFT || status === ContractStatus.REJECTED;
}

export const VALID_STATUS_TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
  [ContractStatus.DRAFT]: [ContractStatus.IN_REVIEW],
  [ContractStatus.IN_REVIEW]: [ContractStatus.APPROVED, ContractStatus.REJECTED],
  [ContractStatus.APPROVED]: [],
  [ContractStatus.REJECTED]: [ContractStatus.DRAFT],
};

export function isValidStatusTransition(
  currentStatus: ContractStatus,
  newStatus: ContractStatus
): boolean {
  return VALID_STATUS_TRANSITIONS[currentStatus].includes(newStatus);
}
