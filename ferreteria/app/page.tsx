"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES } from "@/data/products";
import { useProductStore } from "@/lib/ProductStoreContext";
import { whatsAppUrl } from "@/lib/whatsapp";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function HomePage() {
  const { products, loading, error } = useProductStore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Todos");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        activeCategory === "Todos" || p.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q) ?? false);
      return matchCat && matchSearch;
    });
  }, [products, search, activeCategory]);

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </div>
      )}
      {/* Hero banner */}
      <div className="rounded-2xl bg-orange-600 p-6 sm:p-10 mb-8 text-white shadow-md shadow-orange-600/20">
        <div className="flex items-center gap-3 sm:gap-4 mb-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/30 bg-white/95 p-1 sm:h-16 sm:w-16">
            <Image
              src="/logo-gonzalez-hermanos.png"
              alt="González Hnos Ferretería"
              fill
              className="object-contain"
              sizes="64px"
              priority
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
            Bienvenido a nuestra Ferretería
          </h1>
        </div>
        <p className="text-sm text-white/90 sm:text-base mb-4 max-w-2xl">
          Encontrá todo lo que necesitás para tu proyecto y pedí fácil por WhatsApp.
        </p>
        <a
          href={whatsAppUrl(
            "Hola, quería consultarles por la ferretería González Hnos."
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Consultanos por WhatsApp
        </a>
      </div>

      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter icon for mobile label */}
        <div className="hidden sm:flex items-center gap-1 text-sm text-gray-500 self-center">
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filtrar:</span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
        {["Todos", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? "bg-orange-600 text-white"
                : "bg-white border border-gray-300 text-gray-600 hover:border-orange-400 hover:text-orange-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        {loading
          ? "Cargando productos..."
          : filtered.length === 0
          ? "No se encontraron productos"
          : `${filtered.length} producto${filtered.length !== 1 ? "s" : ""}`}
        {search && ` para "${search}"`}
        {activeCategory !== "Todos" && ` en ${activeCategory}`}
      </p>

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="h-80 rounded-xl border border-gray-200 bg-white animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔧</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No encontramos productos
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Intentá con otra búsqueda o categoría
          </p>
          <button
            onClick={() => {
              setSearch("");
              setActiveCategory("Todos");
            }}
            className="text-orange-600 text-sm font-medium hover:underline"
          >
            Ver todos los productos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}


