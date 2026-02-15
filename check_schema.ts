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

async function checkSchema() {
    console.log('Checking profiles table schema...')
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error fetching profiles:', error)
        if (error.message.includes('column')) {
            console.log('Suspected column missing error found.')
        }
    } else {
        console.log('Columns in profiles table:', Object.keys(data[0] || {}))
    }
}

checkSchema()
