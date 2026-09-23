import { config } from 'dotenv';
import { resolve } from 'path';
import { register } from 'ts-node';

register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs', moduleResolution: 'node' },
});

config({ path: resolve(__dirname, '../../../.env') });

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ??= 'e2e-jwt-secret';
process.env.JWT_REFRESH_SECRET ??= 'e2e-jwt-refresh-secret';
process.env.JWT_EXPIRES_IN ??= '15m';
process.env.JWT_REFRESH_EXPIRES_IN ??= '7d';
process.env.DB_HOST ??= 'localhost';
process.env.DB_PORT ??= '5433';
process.env.DB_USERNAME ??= 'jurix';
process.env.DB_PASSWORD ??= 'jurix_dev_2024';
process.env.DB_DATABASE ??= 'jurix_db';
