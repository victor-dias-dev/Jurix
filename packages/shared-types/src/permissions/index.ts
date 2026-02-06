import { UserRole, ContractStatus } from '../enums/index.js';

/**
 * Ações possíveis no sistema
 */
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

/**
 * Matriz de permissões por role
 * Baseada na documentação de regras de negócio
 */
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

/**
 * Verifica se um role tem determinada permissão
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Regras de visibilidade de contratos por status e role
 * - DRAFT: não visível para VIEWER
 * - IN_REVIEW, APPROVED, REJECTED: visível para todos
 */
export function canViewContract(role: UserRole, status: ContractStatus): boolean {
  if (status === ContractStatus.DRAFT) {
    return role === UserRole.ADMIN || role === UserRole.LEGAL;
  }
  return true;
}

/**
 * Regras de edição de contratos por status
 * - DRAFT: pode ser editado
 * - IN_REVIEW: não pode ser editado
 * - APPROVED: nunca pode ser editado
 * - REJECTED: pode retornar para DRAFT
 */
export function canEditContract(status: ContractStatus): boolean {
  return status === ContractStatus.DRAFT || status === ContractStatus.REJECTED;
}

/**
 * Transições de status válidas
 */
export const VALID_STATUS_TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
  [ContractStatus.DRAFT]: [ContractStatus.IN_REVIEW],
  [ContractStatus.IN_REVIEW]: [ContractStatus.APPROVED, ContractStatus.REJECTED],
  [ContractStatus.APPROVED]: [], // Estado final
  [ContractStatus.REJECTED]: [ContractStatus.DRAFT],
};

/**
 * Verifica se uma transição de status é válida
 */
export function isValidStatusTransition(
  currentStatus: ContractStatus,
  newStatus: ContractStatus
): boolean {
  return VALID_STATUS_TRANSITIONS[currentStatus].includes(newStatus);
}

