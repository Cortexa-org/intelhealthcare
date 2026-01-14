import { getDb } from '../server/database/connection.js';

async function up() {
  const db = await getDb();

  if (!(await db.schema.hasTable('reports'))) {
    await db.schema.createTable('reports', (table) => {
      table.uuid('id').primary();
      table.string('type').notNullable();
      table.string('title').notNullable();
      table.uuid('user_id').notNullable();
      table.uuid('generated_by').notNullable();
      table.string('status').notNullable().defaultTo('pending');
      table.text('data');
      table.string('format').defaultTo('json');
      table.text('error_message');
      table.timestamp('created_at').notNullable().defaultTo(db.fn.now());
      table.timestamp('completed_at');
      table.foreign('user_id').references('users.id').onDelete('CASCADE');
      table.foreign('generated_by').references('users.id').onDelete('CASCADE');
      table.index(['user_id', 'type']);
      table.index('created_at');
    });
  }

  if (!(await db.schema.hasTable('report_schedules'))) {
    await db.schema.createTable('report_schedules', (table) => {
      table.uuid('id').primary();
      table.uuid('user_id').notNullable();
      table.string('report_type').notNullable();
      table.string('frequency').notNullable();
      table.text('parameters');
      table.string('status').notNullable().defaultTo('active');
      table.timestamp('last_run');
      table.timestamp('next_run');
      table.timestamp('created_at').notNullable().defaultTo(db.fn.now());
      table.timestamp('updated_at');
      table.foreign('user_id').references('users.id').onDelete('CASCADE');
      table.index(['user_id', 'status']);
      table.index('next_run');
    });
  }

  if (!(await db.schema.hasTable('clinician_feedback'))) {
    await db.schema.createTable('clinician_feedback', (table) => {
      table.uuid('id').primary();
      table.uuid('clinician_id').notNullable();
      table.string('model_id').notNullable();
      table.string('decision_type').notNullable();
      table.text('ai_recommendation');
      table.string('action').notNullable();
      table.text('clinician_decision');
      table.text('reasoning');
      table.timestamp('created_at').notNullable().defaultTo(db.fn.now());
      table.foreign('clinician_id').references('users.id').onDelete('CASCADE');
      table.index(['clinician_id', 'model_id']);
      table.index('created_at');
    });
  }

  if (!(await db.schema.hasTable('consent_records'))) {
    await db.schema.createTable('consent_records', (table) => {
      table.uuid('id').primary();
      table.uuid('user_id').notNullable();
      table.string('consent_type').notNullable();
      table.string('status').notNullable();
      table.text('details');
      table.string('blockchain_hash');
      table.timestamp('granted_at');
      table.timestamp('revoked_at');
      table.timestamp('created_at').notNullable().defaultTo(db.fn.now());
      table.foreign('user_id').references('users.id').onDelete('CASCADE');
      table.index(['user_id', 'consent_type']);
      table.index('status');
    });
  }

  if (!(await db.schema.hasTable('audit_logs'))) {
    await db.schema.createTable('audit_logs', (table) => {
      table.uuid('id').primary();
      table.uuid('user_id');
      table.string('action').notNullable();
      table.string('resource_type').notNullable();
      table.uuid('resource_id');
      table.text('details');
      table.string('ip_address');
      table.string('user_agent');
      table.timestamp('timestamp').notNullable().defaultTo(db.fn.now());
      table.foreign('user_id').references('users.id').onDelete('SET NULL');
      table.index(['user_id', 'action']);
      table.index(['resource_type', 'resource_id']);
      table.index('timestamp');
    });
  }
}

async function down() {
  const db = await getDb();
  await db.schema.dropTableIfExists('audit_logs');
  await db.schema.dropTableIfExists('consent_records');
  await db.schema.dropTableIfExists('clinician_feedback');
  await db.schema.dropTableIfExists('report_schedules');
  await db.schema.dropTableIfExists('reports');
}

up()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

export { up, down };
