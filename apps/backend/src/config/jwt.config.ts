import { ConfigService } from '@nestjs/config';

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

export const getJwtConfig = (configService: ConfigService): JwtConfig => ({
  secret: configService.get<string>('JWT_SECRET', 'default-secret'),
  expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
  refreshSecret: configService.get<string>('JWT_REFRESH_SECRET', 'default-refresh-secret'),
  refreshExpiresIn: configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
});
