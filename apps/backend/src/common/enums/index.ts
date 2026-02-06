/**
 * Perfis de usuário do sistema (RBAC)
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  LEGAL = 'LEGAL',
  VIEWER = 'VIEWER',
}

/**
 * Status do usuário no sistema
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

/**
 * Ciclo de vida do contrato
 */
export enum ContractStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

/**
 * Tipos de ação para log de auditoria
 */
export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CONTRACT_CREATED = 'CONTRACT_CREATED',
  CONTRACT_UPDATED = 'CONTRACT_UPDATED',
  CONTRACT_DELETED = 'CONTRACT_DELETED',
  CONTRACT_SUBMITTED = 'CONTRACT_SUBMITTED',
  CONTRACT_APPROVED = 'CONTRACT_APPROVED',
  CONTRACT_REJECTED = 'CONTRACT_REJECTED',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DEACTIVATED = 'USER_DEACTIVATED',
}

/**
 * Tipos de entidade para auditoria
 */
export enum EntityType {
  CONTRACT = 'CONTRACT',
  USER = 'USER',
  AUTH = 'AUTH',
}

