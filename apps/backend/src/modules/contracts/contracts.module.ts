import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Contract, ContractVersion, User } from '../../models';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Contract, ContractVersion, User]),
    AuditModule,
  ],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
