import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';

import { AuditLog, User } from '../../models';
import { AuditAction, EntityType, AuditLogFilters, PaginatedResponse } from '@jurix/shared-types';

interface CreateAuditLogDto {
  userId: string;
  action: AuditAction;
  entityType: EntityType;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog)
    private readonly auditLogModel: typeof AuditLog,
  ) {}

  async log(data: CreateAuditLogDto): Promise<AuditLog> {
    return this.auditLogModel.create({
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId ?? null,
      metadata: data.metadata ?? null,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
    });
  }

  async findAll(
    filters: AuditLogFilters & { page?: number; limit?: number },
  ): Promise<PaginatedResponse<AuditLog>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const offset = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: WhereOptions<any> = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters.entityId) {
      where.entityId = filters.entityId;
    }

    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        [Op.gte]: filters.startDate,
        [Op.lte]: filters.endDate,
      };
    } else if (filters.startDate) {
      where.createdAt = { [Op.gte]: filters.startDate };
    } else if (filters.endDate) {
      where.createdAt = { [Op.lte]: filters.endDate };
    }

    const { count, rows } = await this.auditLogModel.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findByEntity(
    entityType: EntityType,
    entityId: string,
  ): Promise<AuditLog[]> {
    return this.auditLogModel.findAll({
      where: { entityType, entityId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }
}
