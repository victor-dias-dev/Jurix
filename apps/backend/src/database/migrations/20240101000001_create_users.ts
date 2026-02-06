import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Criar enum de roles
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('ADMIN', 'LEGAL', 'VIEWER');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Criar enum de status
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('name', 255).notNullable();
    table.specificType('role', 'user_role').notNullable().defaultTo('VIEWER');
    table.specificType('status', 'user_status').notNullable().defaultTo('ACTIVE');
    table.string('refresh_token', 500).nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.index('email');
    table.index('role');
    table.index('status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
  await knex.raw('DROP TYPE IF EXISTS user_role');
  await knex.raw('DROP TYPE IF EXISTS user_status');
}

