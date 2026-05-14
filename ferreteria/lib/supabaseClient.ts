"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let browserClient: SupabaseClient | null = null;

function assertAnonKeyLooksConfigured(key: string) {
  const t = key.trim();
  if (
    !t ||
    t.includes("PASTE_") ||
    t.includes("TU-ANON-KEY") ||
    !t.startsWith("eyJ") ||
    t.length < 100
  ) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY en ferreteria/.env.local no es la clave real. En Supabase: Project Settings → API → copiá la clave «anon» «public» (texto largo que empieza con eyJ), pegala en .env.local, guardá y reiniciá npm run dev."
    );
  }
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en ferreteria/.env.local"
    );
  }
  assertAnonKeyLooksConfigured(supabaseAnonKey);

  if (typeof window === "undefined") {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return browserClient;
}
