"use client";

import type { Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabaseClient";

const ADMIN_EMAIL_SUFFIX = "@ferreteria.local";

function resolveLoginEmail(identifier: string): string {
  const t = identifier.trim().toLowerCase();
  if (!t) return "";
  return t.includes("@") ? t : `${t}${ADMIN_EMAIL_SUFFIX}`;
}

function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    return "Usuario/Correo o contraseña incorrectos.";
  }
  if (m.includes("email not confirmed")) {
    return "Confirmá el correo desde el enlace que envió Supabase.";
  }
  if (m.includes("invalid path") || m.includes("invalid url")) {
    return (
      "La URL de Supabase está mal configurada. Tiene que ser solo la Project URL, " +
      "por ejemplo https://abcdefgh.supabase.co (sin /rest/v1, sin espacios ni comillas). " +
      "Revisala en Vercel → Settings → Environment Variables y en Supabase → Project Settings → API."
    );
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
  const email = resolveLoginEmail(emailOrUsername);
  if (!email) throw new Error("Ingresá usuario o correo.");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.session) {
    throw new Error(mapAuthError(error?.message ?? "Error desconocido"));
  }
  return data.session;
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
