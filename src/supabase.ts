import { createClient } from '@supabase/supabase-js'
import type { Database } from './sdk/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — copy .env.example to .env.local')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type { User } from '@supabase/supabase-js'
