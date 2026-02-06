import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AuditService } from './audit.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';
import { UserRole, AuditAction, PaginatedResponse, ApiResponse } from '@jurix/shared-types';
import { AuditLog } from '../../models';
import { EntityType } from '../../models/audit-log.model';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.LEGAL)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('userId') userId?: string,
    @Query('action') action?: AuditAction,
    @Query('entityType') entityType?: EntityType,
    @Query('entityId') entityId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<PaginatedResponse<AuditLog>> {
    return this.auditService.findAll({
      page,
      limit,
      userId,
      action,
      entityType,
      entityId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('entity')
  @Roles(UserRole.ADMIN, UserRole.LEGAL)
  async findByEntity(
    @Query('entityType') entityType: EntityType,
    @Query('entityId') entityId: string,
  ): Promise<ApiResponse<AuditLog[]>> {
    const data = await this.auditService.findByEntity(entityType, entityId);

    return {
      success: true,
      data,
    };
  }
}
