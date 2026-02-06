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
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const isProduction = configService.get<string>('NODE_ENV') === 'production';

        if (!databaseUrl) {
          throw new Error('DATABASE_URL environment variable is required');
        }

        const url = new URL(databaseUrl);
        const host = url.hostname;
        const port = parseInt(url.port, 10) || 5432;

        console.log(`[Database] Connecting to ${host}:${port}`);

        return {
          dialect: 'postgres',
          host,
          port,
          username: url.username,
          password: url.password,
          database: url.pathname.slice(1),
          autoLoadModels: true,
          synchronize: false,
          logging: !isProduction,
          define: {
            timestamps: true,
            underscored: true,
          },
          dialectOptions: isProduction ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          } : undefined,
        };
      },
    }),

    AuthModule,
    UsersModule,
    ContractsModule,
    AuditModule,
    HealthModule,
  ],
})
export class AppModule {}
