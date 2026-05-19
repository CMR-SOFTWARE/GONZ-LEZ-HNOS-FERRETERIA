"use client";

import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
import { useCart } from "@/lib/CartContext";
import { formatPrice, isDecimalUnit } from "@/lib/utils";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const subtotal = totalPrice;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 sm:py-20 px-1">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-gray-400 mb-6">
          Agregá productos desde el catálogo para hacer tu pedido
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
        >
          Ver catálogo
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Mi pedido</h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ product, quantity }) => {
            const decimal = isDecimalUnit(product.unit);
            const step = decimal ? 0.5 : 1;
            const subtotal = product.price * quantity;

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4"
              >
                {/* Image */}
                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
                  <ProductImage
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain p-0.5"
                    sizes="80px"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-black text-sm leading-snug mb-1 truncate">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-400 mb-2">{product.category}</p>

                  <div className="flex items-center justify-between gap-2">
                    {/* Qty controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            product.id,
                            parseFloat((quantity - step).toFixed(2))
                          )
                        }
                        className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-semibold w-12 text-center">
                        {decimal && quantity % 1 !== 0
                          ? quantity.toFixed(2)
                          : quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            product.id,
                            parseFloat((quantity + step).toFixed(2))
                          )
                        }
                        className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <span className="text-xs text-gray-400">
                        {product.unit}
                      </span>
                    </div>

                    {/* Subtotal + delete */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-black">
                        {formatPrice(subtotal)}
                      </span>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mt-1">
                    {formatPrice(product.price)} / {product.unit}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-20">
            <h2 className="font-bold text-black mb-4">Resumen del pedido</h2>

            <div className="space-y-2 text-sm mb-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between gap-2">
                  <span className="text-gray-600 truncate">
                    {product.name}{" "}
                    <span className="text-gray-400">
                      x{quantity % 1 !== 0 ? quantity.toFixed(2) : quantity}
                    </span>
                  </span>
                  <span className="font-medium text-black whitespace-nowrap">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-3 mb-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-black">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-black">Total</span>
                <span className="font-bold text-xl text-orange-600">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                * El envío o retiro se elige al confirmar el pedido y se suma al
                total
              </p>
            </div>

            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Confirmar pedido
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/"
              className="block text-center text-sm text-orange-600 mt-3 hover:underline"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


