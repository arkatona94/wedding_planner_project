import postgres from 'postgres';
import fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

if (!SUPABASE_DB_PASSWORD) {
    console.error('❌ Missing SUPABASE_DB_PASSWORD in .env');
    process.exit(1);
}

// Connection string using the password from .env
const connectionString = `postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.xcjelqmifskowxxdtqrh.supabase.co:5432/postgres`;

const sql = postgres(connectionString);

async function runMigration() {
    try {
        console.log('Reading migration file...');
        const migrationSql = fs.readFileSync('supabase/migrations/20260201120000_secure_rsvp.sql', 'utf8');

        console.log('Executing migration...');
        // Postgres.js allows executing raw sql with the helper `sql.unsafe`
        await sql.unsafe(migrationSql);

        console.log('✅ Migration applied successfully!');
    } catch (error) {
        console.error('❌ Error applying migration:', error);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

runMigration();
