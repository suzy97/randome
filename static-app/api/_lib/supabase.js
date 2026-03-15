import { createClient } from "@supabase/supabase-js";
import { assertEnv, getEnv } from "./env.js";

export function getSupabaseAdmin() {
  assertEnv();

  const { supabaseUrl, supabaseServiceRoleKey } = getEnv();

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
