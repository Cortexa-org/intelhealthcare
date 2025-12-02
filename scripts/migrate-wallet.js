/**
 * Migration: Add wallet authentication support
 * Adds wallet_address, wallet_provider, wallet_blockchain, avatar fields
 * Creates subscriptions table for crypto payments
 */

import { getDb } from '../server/database/connection.js';

async function up() {
  const db = await getDb();
  
  try {
    // Check if wallet columns already exist
    const tableInfo = await db.raw("PRAGMA table_info(users)");
    const columns = tableInfo.map(col => col.name);
    
    // Add wallet-related columns to users table if they don't exist
    if (!columns.includes('wallet_address')) {
      await db.schema.alterTable('users', (table) => {
        table.string('wallet_address').unique();
        table.string('wallet_provider');
        table.string('wallet_blockchain');
        table.string('avatar');
        table.timestamp('last_login');
      });
      console.log('✅ Added wallet columns to users table');
    }

    // Create subscriptions table if it doesn't exist
    const hasSubscriptions = await db.schema.hasTable('subscriptions');
    if (!hasSubscriptions) {
      await db.schema.createTable('subscriptions', (table) => {
        table.uuid('id').primary();
        table.uuid('user_id').notNullable();
        table.string('tier').notNullable().defaultTo('free'); // free, basic, premium, enterprise
        table.string('status').notNullable().defaultTo('active'); // active, expired, cancelled
        table.timestamp('start_date').notNullable();
        table.timestamp('expiry_date');
        table.boolean('auto_renew').defaultTo(false);
        table.string('transaction_hash'); // Blockchain transaction hash
        table.timestamp('created_at').notNullable().defaultTo(db.fn.now());
        table.timestamp('updated_at');
        
        table.foreign('user_id').references('users.id').onDelete('CASCADE');
        table.index('user_id');
        table.index('status');
      });
      console.log('✅ Created subscriptions table');
    }

    // Make email and password_hash nullable for wallet users
    // Note: SQLite doesn't support ALTER COLUMN, so we handle this in application logic
    
    console.log('✅ Wallet authentication migration completed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function down() {
  const db = await getDb();
  
  try {
    // Drop subscriptions table
    await db.schema.dropTableIfExists('subscriptions');
    
    // Note: SQLite doesn't support dropping columns easily
    // In production, you'd use a proper migration tool
    console.log('✅ Wallet authentication migration rolled back');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  up()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { up, down };
