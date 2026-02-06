import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Criar enum de ações de auditoria
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE audit_action AS ENUM (
        'LOGIN',
        'LOGOUT',
        'CONTRACT_CREATED',
        'CONTRACT_UPDATED',
        'CONTRACT_DELETED',
        'CONTRACT_SUBMITTED',
        'CONTRACT_APPROVED',
        'CONTRACT_REJECTED',
        'USER_CREATED',
        'USER_UPDATED',
        'USER_DEACTIVATED'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Criar enum de tipo de entidade
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE entity_type AS ENUM ('CONTRACT', 'USER', 'AUTH');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    table.specificType('action', 'audit_action').notNullable();
    table.specificType('entity_type', 'entity_type').notNullable();
    table.uuid('entity_id').nullable();
    table.jsonb('metadata').nullable();
    table.string('ip_address', 45).nullable();
    table.text('user_agent').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    // Índices para consultas de auditoria
    table.index('user_id');
    table.index('action');
    table.index('entity_type');
    table.index('entity_id');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.raw('DROP TYPE IF EXISTS audit_action');
  await knex.raw('DROP TYPE IF EXISTS entity_type');
}

