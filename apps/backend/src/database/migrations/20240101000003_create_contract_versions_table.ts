import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('contract_versions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('contract_id').notNullable().references('id').inTable('contracts').onDelete('CASCADE');
    table.integer('version').notNullable();
    table.string('title', 500).notNullable();
    table.text('content').notNullable();
    table.specificType('status', 'contract_status').notNullable();
    table.uuid('changed_by_id').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    table.text('change_reason').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();

    // Índices
    table.index('contract_id');
    table.index('version');
    table.index('changed_by_id');

    // Constraint para garantir versão única por contrato
    table.unique(['contract_id', 'version']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('contract_versions');
}
