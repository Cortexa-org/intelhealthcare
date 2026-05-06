/**
 * Subscriptions + optional wallet columns on users (were previously only in scripts/migrate-wallet.js).
 * Ensures initDatabase() / migrate.latest() creates everything auth.js expects.
 */
export async function up(knex) {
  const hasSubs = await knex.schema.hasTable('subscriptions');
  if (!hasSubs) {
    await knex.schema.createTable('subscriptions', (table) => {
      table.text('id').primary();
      table.text('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.text('tier').notNullable().defaultTo('free');
      table.text('status').notNullable().defaultTo('active');
      table.datetime('start_date').notNullable();
      table.datetime('expiry_date');
      table.boolean('auto_renew').defaultTo(false);
      table.text('transaction_hash');
      table.datetime('created_at').defaultTo(knex.fn.now());
      table.datetime('updated_at');
    });
    await knex.raw(
      'CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions (user_id)'
    );
    await knex.raw(
      'CREATE INDEX IF NOT EXISTS subscriptions_created_at_idx ON subscriptions (created_at)'
    );
  }

  const hasWalletCol = await knex.schema.hasColumn('users', 'wallet_address');
  if (!hasWalletCol) {
    await knex.schema.alterTable('users', (table) => {
      table.text('wallet_address');
      table.text('wallet_provider');
      table.text('wallet_blockchain');
      table.text('avatar');
      table.datetime('last_login');
    });
    await knex.raw(
      'CREATE UNIQUE INDEX IF NOT EXISTS users_wallet_address_unique ON users(wallet_address) WHERE wallet_address IS NOT NULL'
    );
  }
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('subscriptions');
  // SQLite: do not drop user columns in down (irreversible without table rebuild)
}
