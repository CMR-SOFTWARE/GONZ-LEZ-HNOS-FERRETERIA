"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { AdminPanel } from "./AdminPanel";
import {
  getAdminSession,
  getAdminAllowlistStatus,
  signInAdmin,
  signOutAdmin,
  subscribeAdminAuth,
} from "@/lib/adminSession";

function AdminLoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const session = await signInAdmin(loginId, password);
      const allow = await getAdminAllowlistStatus(session.user.id);
      if (!allow.ok) {
        await signOutAdmin();
        if (allow.reason === "not_in_list") {
          setError(
            "La sesión es válida pero esta cuenta no está en la lista de administradores. En Supabase ejecutá el script que inserta en app_admins o agregá tu user_id."
          );
        } else {
          setError(
            `No se pudo comprobar permisos (${allow.message}). Revisá que exista la tabla public.app_admins y las políticas RLS.`
          );
        }
        return;
      }
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo iniciar sesión."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[min(640px,calc(100vh-7rem))] w-full flex-col items-center justify-center px-3 py-8 sm:py-12">
      <div className="w-full min-w-0 max-w-md rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/80 ring-1 ring-slate-100 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <p className="mb-5 max-w-sm text-xs leading-relaxed text-gray-500">
            Software desarrollado por{" "}
            <a
              href="https://www.instagram.com/cmrsoftware.sn/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-orange-600 hover:text-orange-700 hover:underline"
            >
              CMR SOFTWARE
            </a>
          </p>
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-white shadow-md shadow-orange-600/25">
            <Lock className="h-7 w-7" strokeWidth={2} aria-hidden />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-black">
            Panel de Administración
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Usuario o correo, y contraseña del administrador
          </p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="admin-login"
              className="block text-sm font-semibold text-gray-700 mb-1.5"
            >
              Usuario o correo
            </label>
            <div className="relative">
              <User
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden
              />
              <input
                id="admin-login"
                type="text"
                autoComplete="username"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full rounded-lg border-0 bg-gray-100 py-3 pl-10 pr-3 text-sm text-black placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500"
                placeholder="HermanosGonzalez"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-pass"
              className="block text-sm font-semibold text-gray-700 mb-1.5"
            >
              Contraseña
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden
              />
              <input
                id="admin-pass"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border-0 bg-gray-100 py-3 pl-10 pr-11 text-sm text-black placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500"
                placeholder="Contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 hover:bg-gray-200/80 hover:text-gray-600"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-orange-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-700 disabled:opacity-60 focus-visible:outline focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 transition-colors"
          >
            {busy ? "Ingresando…" : "Iniciar sesión"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline"
          >
            ← Volver a la tienda
          </Link>
        </div>

        <div className="mt-8 space-y-1.5 border-t border-gray-100 pt-6 text-center text-xs text-gray-500">
          <p>
            <span className="font-medium text-gray-600">Dirección:</span>{" "}
            Alberdi 302, Esquina San Martín
          </p>
          <p>
            <span className="font-medium text-gray-600">Instagram:</span>{" "}
            <a
              href="https://www.instagram.com/ferreteriagonzalezhermanos?igsh=a2t1OHdpbW1yanht"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-orange-600 hover:text-orange-700 hover:underline"
            >
              Ferretería González Hermanos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const syncSession = async () => {
      const session = await getAdminSession();
      if (cancelled) return;
      if (!session?.user) {
        setAuthed(false);
        return;
      }
      const allow = await getAdminAllowlistStatus(session.user.id);
      if (cancelled) return;
      if (allow.ok) {
        setAuthed(true);
      } else {
        await signOutAdmin();
        setAuthed(false);
      }
    };

    void (async () => {
      await syncSession();
      if (!cancelled) setReady(true);
    })();

    const sub = subscribeAdminAuth(async (session) => {
      if (cancelled) return;
      if (!session?.user) {
        setAuthed(false);
        return;
      }
      const allow = await getAdminAllowlistStatus(session.user.id);
      if (!allow.ok) {
        await signOutAdmin();
        setAuthed(false);
        return;
      }
      setAuthed(true);
    });

    return () => {
      cancelled = true;
      sub.unsubscribe();
    };
  }, []);

  if (!ready) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-gray-400 text-sm">
        Cargando…
      </div>
    );
  }

  if (!authed) {
    return (
      <AdminLoginScreen
        onSuccess={() => {
          setAuthed(true);
        }}
      />
    );
  }

  return (
    <AdminPanel
      onLogout={() => {
        void (async () => {
          await signOutAdmin();
          setAuthed(false);
        })();
      }}
    />
  );
}
