import { createClient } from '@supabase/supabase-js'

// These will be provided via environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Validate environment variables
if (!supabaseUrl || supabaseUrl.includes('your-project-ref')) {
  console.error(
    '❌ Missing or invalid VITE_SUPABASE_URL. Please set it in your .env file.'
  )
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
  console.error(
    '❌ Missing or invalid VITE_SUPABASE_ANON_KEY. Please set it in your .env file.\n' +
    'Get your anon key from: https://supabase.com/dashboard/project/vtndzgtkmnrdbrywfzlj/settings/api'
  )
  throw new Error(
    'Supabase anon key is missing. Please add VITE_SUPABASE_ANON_KEY to your .env file and restart the dev server.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
})
