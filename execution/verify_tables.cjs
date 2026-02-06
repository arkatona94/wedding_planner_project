
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const tables = [
    'profiles', 'weddings', 'checklist_items', 'budget_items',
    'guests', 'vendors', 'timeline_events', 'seating_tables',
    'room_elements', 'photos', 'inspiration_boards', 'inspiration_images',
    'communication_logs', 'public_rsvp_submissions'
];

async function verifyAllTables() {
    console.log('--- Database Table Verification ---');
    let allPassed = true;

    for (const table of tables) {
        try {
            const { data, error } = await supabase.from(table).select('count').limit(1);
            if (error) {
                console.log(`❌ ${table.padEnd(25)}: FAILED (${error.message})`);
                allPassed = false;
            } else {
                console.log(`✅ ${table.padEnd(25)}: PASSED`);
            }
        } catch (err) {
            console.log(`❌ ${table.padEnd(25)}: ERROR (${err.message})`);
            allPassed = false;
        }
    }

    if (allPassed) {
        console.log('\n🟢 ALL GREEN: Core infrastructure is fully functional.');
    } else {
        console.log('\n🔴 ISSUES FOUND: Some tables are missing or inaccessible.');
    }
}

verifyAllTables();
