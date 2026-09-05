import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client. Uses the service role key so API routes can
 * read/write lesson history without requiring teacher accounts for this
 * hackathon build. NEVER import this file from a "use client" component —
 * it must only run on the server (API routes / server components).
 *
 * If Supabase env vars are not configured, this returns null and callers
 * fall back to the in-memory store in lib/lessonStore.js so the product
 * still works end-to-end for a demo without any setup.
 */
let cachedClient = null;

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient(url, key, {
      auth: { persistSession: false },
    });
  }

  return cachedClient;
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
