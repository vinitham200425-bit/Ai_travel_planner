import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase environment variables are missing."
  );
}

/*
  This separate client is used only for the magic-link
  password-recovery flow.

  The normal application can continue using:
  "@/lib/supabase"
*/
export const recoverySupabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      flowType: "implicit",
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,

      /*
        Keep the recovery session separate from the normal
        application Supabase client.
      */
      storageKey: "ai-travel-planner-recovery-auth",
    },
  }
);