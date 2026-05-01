import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Create a safe Supabase client. During build/SSG or when env vars aren't
// configured yet, we use a dummy URL so the build doesn't crash.
function createSupabaseClient(): SupabaseClient {
  if (!isValidUrl(supabaseUrl)) {
    return createClient('https://placeholder.supabase.co', 'placeholder-key');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createSupabaseClient();

/** True when real Supabase credentials are configured */
export const isSupabaseConfigured = isValidUrl(supabaseUrl) && supabaseAnonKey.length > 20;
