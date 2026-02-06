/**
 * Perfis de usuário do sistema (RBAC)
 */
export enum UserRole {
  /** Administração completa do sistema */
  ADMIN = 'ADMIN',
  /** Criação, edição e aprovação de contratos */
  LEGAL = 'LEGAL',
  /** Apenas visualização */
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
 * Fluxo: DRAFT → IN_REVIEW → APPROVED | REJECTED
 */
export enum ContractStatus {
  /** Rascunho - pode ser editado livremente */
  DRAFT = 'DRAFT',
  /** Em revisão - visível para VIEWER, não pode ser editado */
  IN_REVIEW = 'IN_REVIEW',
  /** Aprovado - somente leitura, não pode ser excluído */
  APPROVED = 'APPROVED',
  /** Rejeitado - pode retornar para DRAFT */
  REJECTED = 'REJECTED',
}

/**
 * Tipos de entidade para auditoria
 */
export enum EntityType {
  USER = 'USER',
  CONTRACT = 'CONTRACT',
  CONTRACT_VERSION = 'CONTRACT_VERSION',
  SESSION = 'SESSION',
  AUTH = 'AUTH',
}

/**
 * Tipos de ação para log de auditoria
 */
export enum AuditAction {
  // Autenticação
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  
  // Contratos
  CONTRACT_CREATED = 'CONTRACT_CREATED',
  CONTRACT_UPDATED = 'CONTRACT_UPDATED',
  CONTRACT_DELETED = 'CONTRACT_DELETED',
  CONTRACT_SUBMITTED = 'CONTRACT_SUBMITTED',
  CONTRACT_APPROVED = 'CONTRACT_APPROVED',
  CONTRACT_REJECTED = 'CONTRACT_REJECTED',
  
  // Usuários
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DEACTIVATED = 'USER_DEACTIVATED',
}

