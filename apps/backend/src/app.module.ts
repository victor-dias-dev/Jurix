import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';

function parseDatabaseUrl(url: string) {
  const regex = /^postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
  const match = url.match(regex);
  if (!match) return null;
  return {
    username: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4], 10),
    database: match[5],
  };
}

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
        const dbConfig = databaseUrl ? parseDatabaseUrl(databaseUrl) : null;

        return {
          dialect: 'postgres',
          host: dbConfig?.host ?? configService.get<string>('DB_HOST', 'localhost'),
          port: dbConfig?.port ?? configService.get<number>('DB_PORT', 5433),
          username: dbConfig?.username ?? configService.get<string>('DB_USERNAME', 'jurix'),
          password: dbConfig?.password ?? configService.get<string>('DB_PASSWORD', 'jurix_dev_2024'),
          database: dbConfig?.database ?? configService.get<string>('DB_DATABASE', 'jurix_db'),
          autoLoadModels: true,
          synchronize: false,
          logging: configService.get<string>('NODE_ENV') === 'development',
          define: {
            timestamps: true,
            underscored: true,
          },
          dialectOptions: databaseUrl ? {
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
