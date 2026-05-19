"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/CartContext";
import { ShoppingCart, Menu, X, UserCircle } from "lucide-react";
import { useState } from "react";

const STORE_NAME = "GONZÁLEZ-HNOS FERRETERIA";

export function Navbar() {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-2 min-w-0 sm:h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex min-w-0 flex-1 items-center gap-2 font-bold text-orange-600 sm:flex-none sm:text-xl"
          >
            <div className="relative h-9 w-[4.5rem] shrink-0 overflow-hidden rounded-md border border-orange-100 bg-white">
              <Image
                src="/logo-gonzalez-hermanos.png"
                alt={`Logo ${STORE_NAME}`}
                fill
                className="object-contain object-left p-0.5"
                sizes="72px"
                priority
              />
            </div>
            <span className="hidden truncate sm:inline">{STORE_NAME}</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
            <Link
              href="/"
              className="transition-colors hover:text-orange-600"
            >
              Catalogo
            </Link>
            <Link
              href="/cart"
              className="transition-colors hover:text-orange-600"
            >
              Mi pedido
            </Link>
          </nav>

          {/* Cuenta (solo desktop, discreto) + carrito + menú móvil */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              href="/admin"
              className="hidden items-center gap-1.5 rounded-lg border border-gray-200/80 bg-gray-50/50 px-2.5 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:text-gray-800 md:inline-flex"
              title="Cuenta y administración"
            >
              <UserCircle className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
              <span>Cuenta</span>
            </Link>
            <Link
              href="/cart"
              className="relative inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
            >
              <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Carrito</span>
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white sm:-right-2 sm:-top-2 sm:text-xs">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            <button
              type="button"
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-menu"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {menuOpen ? (
                <X className="h-5 w-5" aria-hidden />
              ) : (
                <Menu className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>
        </div>

        {/* Menú móvil / lateral: incluye Cuenta (no visible en la barra superior) */}
        <div
          id="mobile-nav-menu"
          className={`md:hidden ${menuOpen ? "block border-t border-gray-100" : "hidden"}`}
        >
          <nav className="space-y-0.5 py-3 text-center">
            <Link
              href="/"
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              Catalogo
            </Link>
            <Link
              href="/cart"
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              Mi pedido
            </Link>
            <div className="my-2 border-t border-gray-100" aria-hidden />
            <Link
              href="/admin"
              className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              <UserCircle className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
              Cuenta / Administración
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
