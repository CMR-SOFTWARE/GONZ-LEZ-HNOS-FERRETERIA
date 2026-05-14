"use client";

import type { AuthError, Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabaseClient";

/**
 * Supabase Auth solo acepta email. Si el usuario escribe "HermanosGonzalez",
 * probamos estos sufijos (el script SQL usa el primero; .local a veces falla en Auth).
 */
const ADMIN_LOGIN_EMAIL_SUFFIXES = [
  "@ferreteria.local",
  "@ferreteria.invalid",
] as const;

function emailsToTryForLogin(identifier: string): string[] {
  const t = identifier.trim();
  if (!t) return [];
  if (t.includes("@")) {
    const lower = t.toLowerCase();
    return lower === t ? [t] : [t, lower];
  }
  const base = t.toLowerCase();
  return ADMIN_LOGIN_EMAIL_SUFFIXES.map((s) => `${base}${s}`);
}

function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    return "Usuario/Correo o contraseña incorrectos.";
  }
  if (m.includes("email not confirmed")) {
    return "Confirmá el correo desde el enlace que envió Supabase.";
  }
  if (m.includes("api key") || m.includes("jwt")) {
    return "Clave de Supabase incorrecta o proyecto distinto. Revisá .env.local.";
  }
  return `No se pudo iniciar sesión: ${message}`;
}

export async function signInAdmin(
  emailOrUsername: string,
  password: string
): Promise<Session> {
  const supabase = getSupabaseClient();
  const attempts = emailsToTryForLogin(emailOrUsername);
  if (attempts.length === 0) {
    throw new Error("Ingresá usuario o correo.");
  }

  let lastError: AuthError | null = null;
  for (const email of attempts) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error && data.session) {
      return data.session;
    }
    lastError = error;
  }
  throw new Error(mapAuthError(lastError?.message ?? "Error desconocido"));
}

export async function signOutAdmin(): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.auth.signOut();
}

export async function getAdminSession(): Promise<Session | null> {
  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export type AdminAllowlistResult =
  | { ok: true }
  | { ok: false; reason: "not_in_list" }
  | { ok: false; reason: "request_failed"; message: string };

export async function getAdminAllowlistStatus(
  userId: string
): Promise<AdminAllowlistResult> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("app_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("[admin] app_admins:", error);
    return {
      ok: false,
      reason: "request_failed",
      message: error.message,
    };
  }
  if (!data) {
    return { ok: false, reason: "not_in_list" };
  }
  return { ok: true };
}

export function subscribeAdminAuth(
  callback: (session: Session | null) => void
) {
  const supabase = getSupabaseClient();
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return subscription;
}
