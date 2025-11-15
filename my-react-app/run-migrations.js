import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get connection string from environment or use direct URL
const directUrl = process.env.DIRECT_URL || 'postgresql://postgres.vtndzgtkmnrdbrywfzlj:Anjali@1902@aws-1-ap-south-1.pooler.supabase.com:5432/postgres';

const client = new Client({
  connectionString: directUrl,
  ssl: { rejectUnauthorized: false }
});

async function runMigrations() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read and execute migrations in order
    const migrations = [
      '20251114194929_521d62d8-1e65-4905-b29a-08c23f9b3e21.sql',
      '20251114195028_6b8739f3-801d-421c-bef3-08bd0ca0164a.sql'
    ];

    for (const migration of migrations) {
      const migrationPath = join(__dirname, 'supabase', 'migrations', migration);
      console.log(`\n📄 Running migration: ${migration}`);
      
      const sql = readFileSync(migrationPath, 'utf8');
      await client.query(sql);
      console.log(`✅ Migration ${migration} completed`);
    }

    console.log('\n🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();

