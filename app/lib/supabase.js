import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://avshzanvwgvoszjchghm.supabase.co'
const supabasePublishableKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2c2h6YW52d2d2b3N6amNoZ2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3OTc5NzAsImV4cCI6MjA3MzM3Mzk3MH0.ZDfJH6zOaMsvaZrZkA4a1SndvpKR_WJUsX9ZxA8O_1c'

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})