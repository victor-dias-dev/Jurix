import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Criar enum type para status do contrato
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE contract_status AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Criar tabela de contratos
  await knex.schema.createTable('contracts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('title', 500).notNullable();
    table.text('content').notNullable();
    table.specificType('status', 'contract_status').notNullable().defaultTo('DRAFT');
    table.uuid('created_by_id').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    table.integer('current_version').notNullable().defaultTo(1);
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

    // Índices
    table.index('status');
    table.index('created_by_id');
    table.index('created_at');
  });

  // Trigger para atualizar updated_at
  await knex.raw(`
    CREATE TRIGGER update_contracts_updated_at
    BEFORE UPDATE ON contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TRIGGER IF EXISTS update_contracts_updated_at ON contracts');
  await knex.schema.dropTableIfExists('contracts');
  await knex.raw('DROP TYPE IF EXISTS contract_status');
}
