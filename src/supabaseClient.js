import { createClient } from '@supabase/supabase-js'

// ⚠️ Replace these with your actual Supabase project values
// Go to: Supabase Dashboard → Settings → API
const SUPABASE_URL = 'https://gxpaawkzmcpvjdkkwvwm.supabase.co' 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4cGFhd2t6bWNwdmpka2t3dndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MjMyMTcsImV4cCI6MjA5MjQ5OTIxN30.HuIM_A1qRhYRwBJDBTVCzqh7-86W6Xkb_vWsULaFRFg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
