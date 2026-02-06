import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create refresh_tokens table for JWT refresh token management
  const hasTable = await knex.schema.hasTable('refresh_tokens');
  if (!hasTable) {
    await knex.schema.createTable('refresh_tokens', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('token_hash', 255).notNullable().unique();
      table.timestamp('expires_at').notNullable();
      table.boolean('is_revoked').notNullable().defaultTo(false);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

      // Indexes
      table.index('user_id');
      table.index('token_hash');
      table.index('expires_at');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('refresh_tokens');
}
