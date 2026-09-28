import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zbqdjgcuuxrqqtfilbfl.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseAnonKey.length > 20 &&
  supabaseAnonKey !== 'your_supabase_anon_key_here'
);

// Fallback dummy key to allow initialization without throwing at build time
const safeAnonKey = isSupabaseConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

export const supabase = createClient(supabaseUrl, safeAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Checks connection health to the Supabase PostgreSQL database
 */
export async function checkSupabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      error: 'Supabase Anon Key is missing. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    };
  }

  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      // If table doesn't exist yet, return specific message
      if (error.code === '42P01') {
        return {
          connected: true,
          error: 'Connected to Supabase, but tables have not been created yet. Please run supabase_schema.sql in the Supabase SQL Editor.'
        };
      }
      return { connected: false, error: error.message };
    }
    return { connected: true };
  } catch (err: any) {
    return { connected: false, error: err?.message || 'Failed to ping Supabase' };
  }
}

/**
 * Checks connection health to the Render PostgreSQL database via /api/db
 */
export async function checkRenderPostgresConnection(): Promise<{ connected: boolean; version?: string; error?: string }> {
  try {
    const res = await fetch('/api/db?action=health');
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { connected: false, error: errJson.error || `HTTP ${res.status}` };
    }
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { connected: false, error: err?.message || 'Render PostgreSQL API unreachable' };
  }
}

