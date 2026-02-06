import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Criar enum type para ações de auditoria
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

  // Criar enum type para tipo de entidade
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE entity_type AS ENUM ('CONTRACT', 'USER', 'AUTH');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Criar tabela de logs de auditoria (imutável)
  await knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    table.specificType('action', 'audit_action').notNullable();
    table.specificType('entity_type', 'entity_type').notNullable();
    table.uuid('entity_id').nullable();
    table.jsonb('metadata').nullable();
    table.string('ip_address', 50).nullable();
    table.string('user_agent', 500).nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();

    // Índices para consultas de auditoria
    table.index('user_id');
    table.index('action');
    table.index('entity_type');
    table.index('entity_id');
    table.index('created_at');
  });

  // Criar regra para prevenir UPDATE e DELETE (logs são imutáveis)
  await knex.raw(`
    CREATE RULE no_update_audit_logs AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
  `);

  await knex.raw(`
    CREATE RULE no_delete_audit_logs AS ON DELETE TO audit_logs DO INSTEAD NOTHING;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP RULE IF EXISTS no_delete_audit_logs ON audit_logs');
  await knex.raw('DROP RULE IF EXISTS no_update_audit_logs ON audit_logs');
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.raw('DROP TYPE IF EXISTS entity_type');
  await knex.raw('DROP TYPE IF EXISTS audit_action');
}
