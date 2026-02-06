import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5433),
        username: configService.get<string>('DB_USERNAME', 'jurix'),
        password: configService.get<string>('DB_PASSWORD', 'jurix_dev_2024'),
        database: configService.get<string>('DB_DATABASE', 'jurix_db'),
        autoLoadModels: true,
        synchronize: false,
        logging: configService.get<string>('NODE_ENV') === 'development',
        define: {
          timestamps: true,
          underscored: true,
        },
      }),
    }),

    AuthModule,
    UsersModule,
    ContractsModule,
    AuditModule,
    HealthModule,
  ],
})
export class AppModule {}
