import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAllTables() {
    const tables = [
        'profiles',
        'weddings',
        'checklist_items',
        'budget_items',
        'guests',
        'vendors',
        'photos',
        'inspiration_boards',
        'inspiration_images'
    ]

    for (const table of tables) {
        process.stdout.write(`Checking table: ${table}... `)
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1)

        if (error) {
            process.stdout.write(`FAILED: ${error.message}\n`)
        } else {
            process.stdout.write(`OK\n`)
        }
    }
}

checkAllTables().catch(console.error)
