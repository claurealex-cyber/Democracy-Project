import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://npkuhbtuhsgxvkkyzwsb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wa3VoYnR1aHNneHZra3l6d3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMzUxODUsImV4cCI6MjA3MzkxMTE4NX0.GcAu_WAx23ECALUzEQ_atHcnCNGNL2e6JgsCw3cWFvg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
