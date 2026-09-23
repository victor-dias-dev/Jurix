import { ConfigService } from '@nestjs/config';
import { getJwtConfig } from './jwt.config';

describe('getJwtConfig', () => {
  it('refuses to build a config without the signing secrets', () => {
    const configService = {
      get: (key: string) => (key === 'JWT_EXPIRES_IN' ? '15m' : undefined),
    } as unknown as ConfigService;

    expect(() => getJwtConfig(configService)).toThrow('JWT_SECRET não configurado');
  });
});
