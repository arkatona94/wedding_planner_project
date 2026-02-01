import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

if (supabaseAnonKey.startsWith('sb_secret_')) {
    console.error('CRITICAL SECURITY ERROR: You are using a Supabase Secret Key in the browser. Please use the Publishable/Anon key instead.')
    throw new Error('Forbidden use of service API key in the browser.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
