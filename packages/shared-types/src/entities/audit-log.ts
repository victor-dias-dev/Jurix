import { AuditAction, EntityType } from '../enums/index.js';

export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface AuditLogWithUser extends AuditLog {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AuditLogFilters {
  userId?: string;
  action?: AuditAction;
  entityType?: EntityType;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
}
