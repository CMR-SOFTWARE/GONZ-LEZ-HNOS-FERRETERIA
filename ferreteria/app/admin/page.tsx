"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { AdminPanel } from "./AdminPanel";
import {
  isAdminSession,
  saveAdminSession,
  clearAdminSession,
  verifyAdminCredentials,
} from "@/lib/adminSession";

function AdminLoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (verifyAdminCredentials(username, password)) {
      onSuccess();
      return;
    }
    setError("Usuario o contraseña incorrectos");
  };

  return (
    <div className="flex min-h-[min(640px,calc(100vh-7rem))] flex-col items-center justify-center py-8 sm:py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 sm:p-10 shadow-lg shadow-slate-200/80 ring-1 ring-slate-100">
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
            Ingresá tus credenciales para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="admin-user"
              className="block text-sm font-semibold text-gray-700 mb-1.5"
            >
              Usuario
            </label>
            <div className="relative">
              <User
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden
              />
              <input
                id="admin-user"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border-0 bg-gray-100 py-3 pl-10 pr-3 text-sm text-black placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500"
                placeholder="Ingresá tu usuario"
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
                placeholder="Ingresá tu contraseña"
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
            className="w-full rounded-lg bg-orange-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-orange-600 focus-visible:outline focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 transition-colors"
          >
            Iniciar Sesión
          </button>
        </form>

        <p className="mt-6 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-center text-xs text-gray-600">
          <span className="mr-1" aria-hidden>
            🔒
          </span>
          Acceso restringido solo para administradores
        </p>

        <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm">
          <p className="font-semibold text-orange-700">Credenciales de prueba</p>
          <p className="mt-1 text-orange-900">
            Usuario: <strong>admin</strong>
          </p>
          <p className="text-orange-900">
            Contraseña: <strong>ferreteria2024</strong>
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline"
          >
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAdminSession());
    setReady(true);
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
          saveAdminSession();
          setAuthed(true);
        }}
      />
    );
  }

  return (
    <AdminPanel
      onLogout={() => {
        clearAdminSession();
        setAuthed(false);
      }}
    />
  );
}


