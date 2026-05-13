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
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-orange-600">
            <div className="relative h-9 w-9 overflow-hidden rounded-md border border-orange-100 bg-white">
              <Image
                src="/logo-gonzalez-hermanos.png"
                alt={`Logo ${STORE_NAME}`}
                fill
                className="object-contain p-0.5"
                sizes="36px"
                priority
              />
            </div>
            <span className="hidden sm:block">{STORE_NAME}</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/" className="hover:text-orange-600 transition-colors">Catalogo</Link>
            <Link href="/cart" className="hover:text-orange-600 transition-colors">Mi pedido</Link>
          </nav>

          {/* Cuenta + cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:border-gray-300 hover:bg-gray-50 transition-colors"
              title="Cuenta y administracion"
            >
              <UserCircle className="w-4 h-4 text-gray-600" aria-hidden />
              <span>Cuenta</span>
            </Link>
            <Link
              href="/cart"
              className="relative flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Carrito</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              Catalogo
            </Link>
            <Link
              href="/cart"
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              Mi pedido
            </Link>
            <Link
              href="/admin"
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              Cuenta
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}


