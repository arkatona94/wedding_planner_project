
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function initializeDatabase() {
    try {
        console.log(`Connecting to ${supabaseUrl}...`)

        try {
            console.log('Testing simple fetch to Supabase URL...')
            const res = await fetch(supabaseUrl)
            console.log('Fetch Status:', res.status)
        } catch (fetchErr) {
            console.error('Fetch Failed:', fetchErr.message)
        }

        const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20260201090000_initial_schema.sql')
        const sql = fs.readFileSync(migrationPath, 'utf8')

        console.log('Applying migration via RPC...')

        // Note: Supabase REST API doesn't allow raw SQL. 
        // We'll try to check if we can run this via a management endpoint or if we need to use a different approach.
        // Since I don't have the management token, I'll try to use a common trick: 
        // If the project is fresh, we might be able to create the RPC function if we had SQL access.

        // However, the best way without direct PG access or Management token is to advise the user to paste it once.
        // BUT, I can try to verify the keys work by doing a simple select.

        try {
            const { data, error } = await supabase.from('profiles').select('*').limit(1)

            if (error) {
                console.error('API Error:', error.message)
                console.error('Status Code:', error.status)
                console.error('Full Error Object:', JSON.stringify(error, null, 2))
                process.exit(1)
            } else {
                console.log('Database Access: SUCCESS')
                console.log('Row count:', data.length)
            }
        } catch (queryErr) {
            console.error('Query Execution Error:', queryErr.message)
            console.error('Full Query Error:', queryErr)
            process.exit(1)
        }

    } catch (err) {
        console.error('Initialization failed:', err.message)
    }
}

initializeDatabase()
