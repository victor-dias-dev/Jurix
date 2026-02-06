import { ConfigService } from '@nestjs/config';

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export const getDatabaseConfig = (configService: ConfigService): DatabaseConfig => ({
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME', 'jurix'),
  password: configService.get<string>('DB_PASSWORD', 'jurix_dev_2024'),
  database: configService.get<string>('DB_DATABASE', 'jurix_db'),
});
