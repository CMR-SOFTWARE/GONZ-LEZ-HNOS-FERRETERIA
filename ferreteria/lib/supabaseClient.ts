"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

/** URL base del proyecto (solo host, sin /rest/v1 ni barras de más). */
function normalizeSupabaseUrl(raw: string): string {
  const u = raw.replace(/^["']|["']$/g, "").trim();
  if (!u) return u;
  const withProto = /^https?:\/\//i.test(u) ? u : `https://${u}`;
  try {
    const parsed = new URL(withProto);
    const host = parsed.hostname.toLowerCase();
    if (host.endsWith(".supabase.co")) {
      return `${parsed.protocol}//${host}`;
    }
    return parsed.origin;
  } catch {
    return u.replace(/\/+$/, "");
  }
}

function readSupabaseEnv(): { url: string; key: string } {
  const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim();
  const url = normalizeSupabaseUrl(rawUrl);
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "")
    .trim()
    .replace(/^["']|["']$/g, "");
  return { url, key };
}

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
  const { url: supabaseUrl, key: supabaseAnonKey } = readSupabaseEnv();

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
        // Evita parsear #fragmentos en la URL (deploy estático / Vercel) que pueden romper Auth.
        detectSessionInUrl: false,
      },
    });
  }
  return browserClient;
}
