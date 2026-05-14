"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import { formatPrice } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Home,
  Truck,
  MessageSquare,
  Send,
  ShoppingCart,
  Store,
} from "lucide-react";
import { whatsAppUrl } from "@/lib/whatsapp";
import {
  type DeliveryType,
  type PickupBranchId,
  PICKUP_BRANCHES,
  quoteShipping,
  isInteriorDelivery,
} from "@/lib/deliveryPricing";

interface FormData {
  name: string;
  whatsapp: string;
  localidad: string;
  address: string;
  /** Solo si el envío es al interior */
  provincia: string;
  ciudadEnvio: string;
  delivery: DeliveryType;
  /** Sucursal de retiro (solo si delivery = Retiro en sucursal) */
  pickupBranchId: PickupBranchId;
  notes: string;
}

const EMPTY_FORM: FormData = {
  name: "",
  whatsapp: "",
  localidad: "",
  address: "",
  provincia: "",
  ciudadEnvio: "",
  delivery: "",
  pickupBranchId: PICKUP_BRANCHES[0].id,
  notes: "",
};

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormData, string>>
  >({});

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">
          Tu carrito está vacío
        </h2>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) e.name = "Requerido";
    if (!form.whatsapp.trim()) e.whatsapp = "Requerido";
    else if (!/^\d{8,15}$/.test(form.whatsapp.replace(/\s/g, "")))
      e.whatsapp = "Número inválido (solo dígitos, 8-15)";
    if (!form.delivery) e.delivery = "Seleccioná un tipo de entrega";

    if (isInteriorDelivery(form.delivery)) {
      if (!form.provincia.trim()) e.provincia = "Requerido";
      if (!form.ciudadEnvio.trim()) e.ciudadEnvio = "Requerido";
      if (!form.address.trim())
        e.address = "Indicá calle, número, piso y código postal si podés";
    } else if (form.delivery === "Retiro en sucursal") {
      if (!form.localidad.trim()) e.localidad = "Requerido";
    } else {
      if (!form.localidad.trim()) e.localidad = "Requerido";
      if (form.delivery === "Envío local" && !form.address.trim())
        e.address = "La dirección es requerida para envío local";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const shippingQuote = useMemo(
    () => quoteShipping(form.delivery, { provincia: form.provincia }),
    [form.delivery, form.provincia]
  );
  const grandTotal = totalPrice + shippingQuote.amount;

  const pickupBranch =
    PICKUP_BRANCHES.find((b) => b.id === form.pickupBranchId) ??
    PICKUP_BRANCHES[0];

  const buildWhatsAppMessage = (): string => {
    const lines = ["Hola, quiero hacer un pedido:", ""];

    items.forEach(({ product, quantity }) => {
      const qty =
        product.unit === "metro" || product.unit === "litro"
          ? quantity % 1 !== 0
            ? quantity.toFixed(2)
            : `${quantity}`
          : `${Math.round(quantity)}`;
      lines.push(`- ${product.name} x ${qty} ${product.unit}`);
    });

    lines.push("");
    lines.push(`Subtotal productos: ${formatPrice(totalPrice)}`);
    lines.push(shippingQuote.detailLine);
    lines.push(`*Total estimado: ${formatPrice(grandTotal)}*`);
    lines.push("");
    lines.push(`Nombre: ${form.name}`);
    lines.push(
      `WhatsApp de contacto: +54${form.whatsapp.replace(/\s/g, "")}`
    );
    lines.push(`Tipo de entrega: ${form.delivery}`);
    if (form.delivery === "Retiro en sucursal") {
      lines.push(`Sucursal: ${pickupBranch.label}`);
      lines.push(`Dirección de retiro: ${pickupBranch.address}`);
    } else if (isInteriorDelivery(form.delivery)) {
      lines.push(`Provincia: ${form.provincia}`);
      lines.push(`Ciudad: ${form.ciudadEnvio}`);
      lines.push(`Dirección: ${form.address}`);
    } else {
      lines.push(`Localidad: ${form.localidad}`);
      lines.push(`Dirección: ${form.address || "-"}`);
    }
    lines.push("");
    lines.push(`Observaciones: ${form.notes || "-"}`);

    return lines.join("\n");
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const message = buildWhatsAppMessage();
    const url = whatsAppUrl(message);
    window.open(url, "_blank");
    clearCart();
    router.push("/");
  };

  const field = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al carrito
      </Link>

      <h1 className="text-2xl font-bold text-black mb-6">
        Confirmar pedido
      </h1>

      <div className="grid gap-6">
        {/* Order summary */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <h2 className="font-semibold text-orange-900 mb-3 text-sm">
            Resumen ({items.length} producto{items.length !== 1 ? "s" : ""})
          </h2>
          <div className="space-y-1.5">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span className="text-orange-700 truncate mr-2">
                  {product.name}{" "}
                  <span className="text-orange-500">
                    x{quantity % 1 !== 0 ? quantity.toFixed(2) : quantity}{" "}
                    {product.unit}
                  </span>
                </span>
                <span className="font-medium text-orange-900 whitespace-nowrap">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-orange-200 pt-2 mt-3 space-y-1.5 text-sm text-orange-900">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-800/90">{shippingQuote.summaryLine}</span>
              <span className="font-medium">
                {shippingQuote.amount > 0
                  ? formatPrice(shippingQuote.amount)
                  : form.delivery === "Envío al interior (a coordinar)" &&
                      shippingQuote.amount === 0
                    ? "A coordinar"
                    : formatPrice(0)}
              </span>
            </div>
            <div className="flex justify-between font-bold pt-1 border-t border-orange-200/80">
              <span>Total estimado</span>
              <span className="text-lg">{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-bold text-black mb-4">Datos del pedido</h2>

          {/* Name */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
              <User className="w-3.5 h-3.5" />
              Nombre completo *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => field("name", e.target.value)}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.name ? "border-red-400" : "border-gray-300"
              }`}
              placeholder="Juan Pérez"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
              <Phone className="w-3.5 h-3.5" />
              WhatsApp *
            </label>
            <div className="flex">
              <span className="flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-500">
                +54
              </span>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => field("whatsapp", e.target.value)}
                className={`flex-1 border rounded-r-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.whatsapp ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="2461 123456"
              />
            </div>
            {errors.whatsapp && (
              <p className="text-xs text-red-500 mt-1">{errors.whatsapp}</p>
            )}
          </div>

          {/* Delivery type — primero para mostrar los campos que correspondan */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
              <Truck className="w-3.5 h-3.5" />
              Tipo de entrega *
            </label>
            <select
              value={form.delivery}
              onChange={(e) => {
                const v = e.target.value as DeliveryType;
                setForm((prev) => ({
                  ...prev,
                  delivery: v,
                  ...(v !== "Envío al interior (a coordinar)"
                    ? { provincia: "", ciudadEnvio: "" }
                    : {}),
                }));
                setErrors({});
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            >
              <option value="">Seleccioná una opción</option>
              <option value="Retiro en sucursal">🏪 Retiro en sucursal</option>
              <option value="Envío local">🛵 Envío a domicilio (zona local)</option>
              <option value="Envío al interior (a coordinar)">
                📦 Envío al interior (a coordinar)
              </option>
            </select>
            {errors.delivery && (
              <p className="text-xs text-red-500 mt-1">{errors.delivery}</p>
            )}
          </div>

          {/* Sucursal de retiro */}
          {form.delivery === "Retiro en sucursal" && (
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                <Store className="w-3.5 h-3.5" />
                Sucursal donde retirás *
              </label>
              <select
                value={form.pickupBranchId}
                onChange={(e) =>
                  field("pickupBranchId", e.target.value as PickupBranchId)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                {PICKUP_BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                📍 {pickupBranch.address}
              </p>
            </div>
          )}

          {/* Localidad: retiro y envío en la ciudad */}
          {!isInteriorDelivery(form.delivery) && (
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-3.5 h-3.5" />
                Localidad *
              </label>
              <input
                type="text"
                value={form.localidad}
                onChange={(e) => field("localidad", e.target.value)}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.localidad ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="San Nicolás de los Arroyos"
              />
              {errors.localidad && (
                <p className="text-xs text-red-500 mt-1">{errors.localidad}</p>
              )}
            </div>
          )}

          {/* Envío al interior: provincia, ciudad y dirección */}
          {isInteriorDelivery(form.delivery) && (
            <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50/60 p-4">
              <p className="text-sm font-semibold text-amber-900">
                Datos de envío fuera de la ciudad
              </p>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Provincia *
                </label>
                <input
                  type="text"
                  value={form.provincia}
                  onChange={(e) => field("provincia", e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white ${
                    errors.provincia ? "border-red-400" : "border-gray-300"
                  }`}
                  placeholder="Ej. Buenos Aires, Santa Fe…"
                />
                {errors.provincia && (
                  <p className="text-xs text-red-500 mt-1">{errors.provincia}</p>
                )}
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Ciudad *
                </label>
                <input
                  type="text"
                  value={form.ciudadEnvio}
                  onChange={(e) => field("ciudadEnvio", e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white ${
                    errors.ciudadEnvio ? "border-red-400" : "border-gray-300"
                  }`}
                  placeholder="Nombre de la ciudad o localidad"
                />
                {errors.ciudadEnvio && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.ciudadEnvio}
                  </p>
                )}
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                  <Home className="w-3.5 h-3.5" />
                  Dirección completa *
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => field("address", e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white ${
                    errors.address ? "border-red-400" : "border-gray-300"
                  }`}
                  placeholder="Calle, número, piso/depto, referencias, CP"
                />
                {errors.address && (
                  <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                )}
              </div>
            </div>
          )}

          {/* Dirección: envío local (misma ciudad) */}
          {form.delivery === "Envío local" && (
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                <Home className="w-3.5 h-3.5" />
                Dirección *
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => field("address", e.target.value)}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.address ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="Av. Rivadavia 1234, Piso 2"
              />
              {errors.address && (
                <p className="text-xs text-red-500 mt-1">{errors.address}</p>
              )}
            </div>
          )}

          {/* Retiro: sin dirección de envío */}
          {form.delivery === "Retiro en sucursal" && (
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                <Home className="w-3.5 h-3.5" />
                Dirección de envío
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => field("address", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-400"
                placeholder="No aplica — retirás en la sucursal elegida"
                disabled
              />
            </div>
          )}

          {form.delivery === "" && (
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-500 mb-1">
                <Home className="w-3.5 h-3.5" />
                Dirección
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => field("address", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-400"
                placeholder="Elegí primero el tipo de entrega"
                disabled
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
              <MessageSquare className="w-3.5 h-3.5" />
              Observaciones
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => field("notes", e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              placeholder="Color preferido, medidas especiales, horario de entrega..."
            />
          </div>
        </div>

        {/* WhatsApp button */}
        <div className="space-y-3">
          <button
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 active:scale-95 text-white py-4 rounded-xl font-bold text-base transition-all"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span>Enviar pedido por WhatsApp</span>
            <Send className="w-5 h-5" />
          </button>
          <p className="text-xs text-center text-gray-400">
            Se abrirá WhatsApp con tu pedido listo para enviar
          </p>
        </div>
      </div>
    </div>
  );
}


