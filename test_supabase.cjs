
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://redpsmlxapptbrqeygqo.supabase.co'
const supabaseKey = 'sb_secret_HQod82o0XOxZvu5zz8yTDg_RQ5JB1NR'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
    try {
        const { data, error } = await supabase.from('_non_existent_table').select('*').limit(1)
        // We expect a "relation does not exist" error, but not an "Invalid API Key" error
        if (error && error.message.includes('Invalid API Key')) {
            console.log('RESULT: INVALID_KEY')
        } else if (error) {
            console.log('RESULT: VALID_KEY (Error: ' + error.message + ')')
        } else {
            console.log('RESULT: VALID_KEY (Success)')
        }
    } catch (err) {
        console.log('RESULT: ERROR (' + err.message + ')')
    }
}

testConnection()
