import { AuditAction } from '../enums/index.js';

/**
 * Log de Auditoria
 * Registro imutável de ações relevantes executadas no sistema
 */
export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  entityType: 'CONTRACT' | 'USER' | 'AUTH';
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

/**
 * Log com informações do usuário
 */
export interface AuditLogWithUser extends AuditLog {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Filtros para busca de logs
 */
export interface AuditLogFilters {
  userId?: string;
  action?: AuditAction;
  entityType?: 'CONTRACT' | 'USER' | 'AUTH';
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
}

