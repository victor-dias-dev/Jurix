import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { RefreshToken, User } from '../../models';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    SequelizeModule.forFeature([User, RefreshToken]),
    AuditModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
