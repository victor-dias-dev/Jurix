import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuditLog } from '../../models';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';

@Module({
  imports: [SequelizeModule.forFeature([AuditLog])],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
