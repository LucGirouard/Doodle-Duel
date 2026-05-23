import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug: Log environment variables (only in development)
if (process.env.NODE_ENV === "development") {
  console.log("=== Supabase Configuration Debug ===");
  console.log("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? `"${supabaseUrl}"` : "undefined");
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : "undefined");
  console.log("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceRoleKey ? `${supabaseServiceRoleKey.substring(0, 20)}...` : "undefined");
}

// Check if Supabase is properly configured
const isValidSupabaseUrl = supabaseUrl && (supabaseUrl.startsWith("https://") || supabaseUrl.startsWith("http://"));
const isSupabaseConfigured = Boolean(isValidSupabaseUrl && supabaseServiceRoleKey);

if (!isSupabaseConfigured && process.env.NODE_ENV === "development") {
  console.error(
    "❌ Supabase Configuration Error:"
  );
  if (!supabaseUrl) {
    console.error("   - NEXT_PUBLIC_SUPABASE_URL is not set");
  } else if (!isValidSupabaseUrl) {
    console.error("   - NEXT_PUBLIC_SUPABASE_URL must start with https:// or http://");
  }
  if (!supabaseServiceRoleKey) {
    console.error("   - SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  console.error("   Please check your .env.local file. Example:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co");
  console.error("   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key");
}

// Create Supabase client for server-side operations
// Uses the service_role key which bypasses RLS policies
// Only create the client if we have valid configuration
export const supabaseAdmin = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseServiceRoleKey!)
  : null;

// Create Supabase client for client-side operations
// Uses the anon key which respects RLS policies
// Only create the client if we have a valid URL
export const supabase = isValidSupabaseUrl
  ? createClient(supabaseUrl!, supabaseAnonKey || "")
  : null;
