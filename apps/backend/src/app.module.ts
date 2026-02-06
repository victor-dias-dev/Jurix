import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';

function parseDatabaseUrl(url: string) {
  try {
    const parsed = new URL(url);
    return {
      username: parsed.username,
      password: parsed.password,
      host: parsed.hostname,
      port: parseInt(parsed.port, 10) || 5432,
      database: parsed.pathname.slice(1).split('?')[0],
    };
  } catch {
    return null;
  }
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

        const host = dbConfig?.host ?? configService.get<string>('DB_HOST', 'localhost');
        const port = dbConfig?.port ?? configService.get<number>('DB_PORT', 5432);

        console.log(`[Database] Connecting to ${host}:${port} (using ${databaseUrl ? 'DATABASE_URL' : 'individual vars'})`);

        return {
          dialect: 'postgres',
          host,
          port,
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
