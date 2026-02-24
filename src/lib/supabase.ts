import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use localStorage instead of sessionStorage to persist across browser sessions
    storage: window.localStorage,
    // Auto refresh token before it expires
    autoRefreshToken: true,
    // Persist session across page refreshes and browser restarts
    persistSession: true,
    // Detect session from URL (for email confirmations, password resets)
    detectSessionInUrl: true,
    // Set token expiry to 7 days (604800 seconds)
    // Note: This is a client-side setting. Server-side JWT expiry is controlled by Supabase project settings
    storageKey: 'jd-management-auth',
  },
});