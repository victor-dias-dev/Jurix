import type { Knex } from 'knex';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carregar .env do diretório raiz do backend
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Debug: mostrar qual porta está sendo usada
const dbPort = Number(process.env.DB_PORT) || 5433;
console.log(`[Knex] Connecting to PostgreSQL on port: ${dbPort}`);

const config: Record<string, Knex.Config> = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: dbPort,
      user: process.env.DB_USERNAME || 'jurix',
      password: process.env.DB_PASSWORD || 'jurix_dev_2024',
      database: process.env.DB_DATABASE || 'jurix_db',
    },
    migrations: {
      directory: './migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './seeds',
      extension: 'ts',
    },
  },
  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: { rejectUnauthorized: false },
    },
    migrations: {
      directory: './migrations',
      extension: 'ts',
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};

export default config;
module.exports = config;
