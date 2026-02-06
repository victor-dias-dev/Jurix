import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Criar enum types
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('ADMIN', 'LEGAL', 'VIEWER');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Criar tabela de usuários
  const hasUsersTable = await knex.schema.hasTable('users');
  if (!hasUsersTable) {
    await knex.schema.createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('email', 255).notNullable().unique();
      table.string('password_hash', 255).notNullable();
      table.string('name', 255).notNullable();
      table.specificType('role', 'user_role').notNullable().defaultTo('VIEWER');
      table.specificType('status', 'user_status').notNullable().defaultTo('ACTIVE');
      table.string('refresh_token', 500).nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
      table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

      // Índices
      table.index('email');
      table.index('role');
      table.index('status');
    });
  }

  // Trigger para atualizar updated_at
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  await knex.raw(`
    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TRIGGER IF EXISTS update_users_updated_at ON users');
  await knex.schema.dropTableIfExists('users');
  await knex.raw('DROP TYPE IF EXISTS user_status');
  await knex.raw('DROP TYPE IF EXISTS user_role');
}
