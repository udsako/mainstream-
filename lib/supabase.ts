import { createClient } from "@supabase/supabase-js";

// Server-side only — never import this in a "use client" component.
// Uses the service role key, which bypasses row-level security, so it must
// stay in server code (API routes) and never be exposed to the browser.
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
