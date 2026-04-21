import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rmerwwmamddqrqtxvkrx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtZXJ3d21hbWRkcXJxdHh2a3J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTI1NDUsImV4cCI6MjA4MDYyODU0NX0.YHisGW9c1pxl-QfwBMkLAJGl7vNdupP2s1ZhZp5mdI4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
