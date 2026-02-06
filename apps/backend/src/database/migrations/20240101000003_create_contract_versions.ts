import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('contract_versions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('contract_id').notNullable().references('id').inTable('contracts').onDelete('CASCADE');
    table.integer('version').notNullable();
    table.string('title', 255).notNullable();
    table.text('content').notNullable();
    table.specificType('status', 'contract_status').notNullable();
    table.uuid('changed_by_id').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    table.text('change_reason').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.unique(['contract_id', 'version']);
    table.index('contract_id');
    table.index('changed_by_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('contract_versions');
}

