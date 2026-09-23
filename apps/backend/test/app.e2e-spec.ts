import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { resolve } from 'path';
import knex, { Knex } from 'knex';
import request from 'supertest';


import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters';

describe('Jurix API (e2e)', () => {
  let app: INestApplication;
  let db: Knex;

  beforeAll(async () => {
    db = knex({
      client: 'pg',
      connection: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
      },
      migrations: {
        directory: resolve(__dirname, '../src/database/migrations'),
        extension: 'ts',
        loadExtensions: ['.ts'],
      },
      seeds: {
        directory: resolve(__dirname, '../src/database/seeds'),
        extension: 'ts',
        loadExtensions: ['.ts'],
      },
    });

    await db.migrate.latest();
    await db.seed.run();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
    await db.destroy();
  });

  it('uses one message for unknown users and wrong passwords', async () => {
    const missing = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'nobody@jurix.com', password: 'wrong-password' });
    const wrong = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'legal@jurix.com', password: 'wrong-password' });

    expect(missing.status).toBe(401);
    expect(wrong.status).toBe(401);
    expect(missing.body.error.message).toBe('Credenciais inválidas');
    expect(wrong.body.error.message).toBe(missing.body.error.message);
  });

  it('creates a contract and submits it for review', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'legal@jurix.com', password: 'Legal@123' })
      .expect(200);

    const token = login.body.data.accessToken as string;

    const created = await request(app.getHttpServer())
      .post('/api/contracts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Acordo de confidencialidade',
        content: 'Conteúdo mínimo do contrato de teste.',
      })
      .expect(201);

    expect(created.body.data.status).toBe('DRAFT');

    const submitted = await request(app.getHttpServer())
      .post(`/api/contracts/${created.body.data.id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(submitted.body.data.status).toBe('IN_REVIEW');
  });
});
