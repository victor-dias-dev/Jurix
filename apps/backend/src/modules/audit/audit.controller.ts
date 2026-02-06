import {
  Controller,
  Get,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';

import { AuditService } from './audit.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';
import { ZodValidationPipe } from '../../common/pipes';
import {
  queryAuditSchema,
  QueryAuditDto,
  queryAuditByEntitySchema,
  QueryAuditByEntityDto,
} from './schemas';
import { UserRole, PaginatedResponse, ApiResponse } from '@jurix/shared-types';
import { AuditLog } from '../../models';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.LEGAL)
  @UsePipes(new ZodValidationPipe(queryAuditSchema))
  async findAll(
    @Query() query: QueryAuditDto,
  ): Promise<PaginatedResponse<AuditLog>> {
    return this.auditService.findAll(query);
  }

  @Get('entity')
  @Roles(UserRole.ADMIN, UserRole.LEGAL)
  @UsePipes(new ZodValidationPipe(queryAuditByEntitySchema))
  async findByEntity(
    @Query() query: QueryAuditByEntityDto,
  ): Promise<ApiResponse<AuditLog[]>> {
    const data = await this.auditService.findByEntity(query.entityType, query.entityId);

    return {
      success: true,
      data,
    };
  }
}
