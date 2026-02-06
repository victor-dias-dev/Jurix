import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Criar enum de status do contrato
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE contract_status AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await knex.schema.createTable('contracts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 255).notNullable();
    table.text('content').notNullable();
    table.specificType('status', 'contract_status').notNullable().defaultTo('DRAFT');
    table.uuid('created_by_id').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    table.integer('current_version').notNullable().defaultTo(1);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.index('status');
    table.index('created_by_id');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('contracts');
  await knex.raw('DROP TYPE IF EXISTS contract_status');
}

