"use client";

import { useEffect, useRef, useState } from "react";
import { Product } from "@/data/products";
import { ProductImage } from "@/components/ProductImage";
import { useCart } from "@/lib/CartContext";
import { useProductImage } from "@/lib/useProductImage";
import { formatPrice, isDecimalUnit, getStockStatus } from "@/lib/utils";
import { ShoppingCart, Plus, Minus, Package, Loader2 } from "lucide-react";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(isDecimalUnit(product.unit) ? 1.0 : 1);
  const [added, setAdded] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(priority);

  useEffect(() => {
    if (priority) return;
    const el = imageRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "280px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [priority]);

  const { imageSrc, loading: imageLoading } = useProductImage(
    product.id,
    product.imageUrl,
    inView
  );

  const decimal = isDecimalUnit(product.unit);
  const step = decimal ? 0.5 : 1;
  const min = decimal ? 0.5 : 1;

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const increment = () =>
    setQty((prev) => parseFloat((prev + step).toFixed(2)));
  const decrement = () =>
    setQty((prev) => Math.max(min, parseFloat((prev - step).toFixed(2))));

  const stockStatus = getStockStatus(product.stock);
  const stockLow = stockStatus === "low";
  const outOfStock = stockStatus === "out";

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Image */}
      <div
        ref={imageRef}
        className="relative h-[14.5rem] overflow-hidden bg-gray-100"
      >
        {imageLoading && !imageSrc?.trim() ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
            <span className="sr-only">Cargando foto</span>
          </div>
        ) : null}
        <ProductImage
          src={imageSrc}
          alt={product.name}
          fill
          className="object-contain object-center p-2"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
        />
        <div className="absolute top-2 left-2">
          <span className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>
        {stockLow && (
          <div className="absolute top-2 right-2">
            <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full">
              ¡Últimos!
            </span>
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
            <span className="bg-white text-gray-700 text-sm font-semibold px-3 py-1 rounded-full">
              Sin stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1">
        <h3 className="font-semibold text-black text-[13px] leading-snug mb-1 line-clamp-2">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-[11px] text-gray-500 mb-2 line-clamp-1">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-base font-semibold text-black">
              {formatPrice(product.price)}
            </span>
            <span className="text-[10px] text-gray-500">/ {product.unit}</span>
          </div>

          {/* Stock indicator */}
          <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-2.5">
            <Package className="w-3 h-3" />
            <span>{outOfStock ? "Sin stock" : `${product.stock} en stock`}</span>
          </div>

          {/* Quantity controls */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={decrement}
              disabled={outOfStock}
              className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
              type="number"
              min={min}
              step={step}
              value={qty}
              onChange={(e) => {
                const val = decimal
                  ? parseFloat(e.target.value)
                  : parseInt(e.target.value);
                if (!isNaN(val) && val >= min) setQty(val);
              }}
              disabled={outOfStock}
              className="flex-1 h-8 text-center text-sm font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-40"
            />
            <button
              onClick={increment}
              disabled={outOfStock}
              className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
            <span className="text-[11px] text-gray-500 whitespace-nowrap">
              {product.unit}
            </span>
          </div>

          {/* Add button */}
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className={`w-full py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-150 flex items-center justify-center gap-2 ${
              added
                ? "bg-green-600 text-white"
                : outOfStock
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-orange-600 text-white hover:bg-orange-700 active:scale-95"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {added ? "¡Agregado!" : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </div>
  );
}


