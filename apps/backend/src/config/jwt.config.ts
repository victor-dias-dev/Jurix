import { ConfigService } from '@nestjs/config';

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

function requireConfig(configService: ConfigService, key: string): string {
  const value = configService.get<string>(key);

  if (!value) {
    throw new Error(`${key} não configurado`);
  }

  return value;
}

export const getJwtConfig = (configService: ConfigService): JwtConfig => ({
  secret: requireConfig(configService, 'JWT_SECRET'),
  expiresIn: configService.get<string>('JWT_EXPIRES_IN') ?? '15m',
  refreshSecret: requireConfig(configService, 'JWT_REFRESH_SECRET'),
  refreshExpiresIn: configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
});
