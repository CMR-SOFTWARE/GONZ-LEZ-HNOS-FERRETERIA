/**
 * Tarifas de envío / retiro (editá los montos acá o mové esto a Supabase más adelante).
 * Los montos están en ARS (pesos), sin decimales en la lógica; formatPrice los muestra bien.
 */

export type DeliveryType =
  | ""
  | "Retiro en sucursal"
  | "Envío local"
  | "Envío al interior (a coordinar)";

/** Sucursales para retiro (nombre corto + dirección que va al pedido). */
export const PICKUP_BRANCHES = [
  {
    id: "mitre",
    label: "Sucursal Av. Mitre",
    address: "Av. Mitre 845, San Nicolás – Lun a Vie 8 a 18hs",
  },
  {
    id: "alberdi",
    label: "Sucursal Alberdi",
    address: "Av. Alberdi 302, San Nicolás – Lun a Vie 8 a 17hs",
  },
] as const;

export type PickupBranchId = (typeof PICKUP_BRANCHES)[number]["id"];

/** Envío en la ciudad (moto / cadete fijo). */
export const SHIPPING_LOCAL_ARS = 3500;

/**
 * Envío al interior: monto fijo por provincia (nombre aproximado, se compara en minúsculas).
 * Si la provincia no está en el mapa, `amount` queda 0 y `note` indica coordinación.
 */
export const SHIPPING_INTERIOR_BY_PROVINCE_ARS: Record<string, number> = {
  "buenos aires": 7500,
  "santa fe": 9000,
  "córdoba": 12000,
  cordoba: 12000,
  "entre ríos": 8500,
  "entre rios": 8500,
};

export function normalizeProvinceKey(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export type ShippingQuote = {
  amount: number;
  /** Texto corto para el resumen (ej. "Envío local") */
  summaryLine: string;
  /** Detalle para WhatsApp */
  detailLine: string;
};

export function quoteShipping(
  delivery: DeliveryType,
  opts: { provincia?: string }
): ShippingQuote {
  if (!delivery) {
    return {
      amount: 0,
      summaryLine: "Entrega",
      detailLine: "Elegí retiro o envío para calcular el total",
    };
  }
  if (delivery === "Retiro en sucursal") {
    return {
      amount: 0,
      summaryLine: "Retiro en sucursal",
      detailLine: "Sin costo de envío (retiro en sucursal)",
    };
  }
  if (delivery === "Envío local") {
    return {
      amount: SHIPPING_LOCAL_ARS,
      summaryLine: "Envío a domicilio (zona local)",
      detailLine: `Envío local: ${SHIPPING_LOCAL_ARS.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })}`,
    };
  }
  const key = normalizeProvinceKey(opts.provincia ?? "");
  const byProvince = key ? SHIPPING_INTERIOR_BY_PROVINCE_ARS[key] : undefined;
  if (byProvince != null && byProvince > 0) {
    return {
      amount: byProvince,
      summaryLine: "Envío al interior (estimado)",
      detailLine: `Envío al interior (${opts.provincia?.trim() || "provincia"}): ${byProvince.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })} — sujeto a confirmación`,
    };
  }
  return {
    amount: 0,
    summaryLine: "Envío al interior (a coordinar)",
    detailLine:
      "Envío al interior: costo a coordinar por WhatsApp según paquete y transporte",
  };
}

export function isInteriorDelivery(d: DeliveryType): boolean {
  return d === "Envío al interior (a coordinar)";
}

/** Campos del formulario de checkout que intervienen en la validación. */
export interface CheckoutFields {
  name: string;
  whatsapp: string;
  delivery: DeliveryType;
  localidad: string;
  address: string;
  provincia: string;
  ciudadEnvio: string;
}

/**
 * Valida el formulario de checkout según el tipo de entrega elegido.
 * Devuelve un objeto con los errores por campo; si está vacío, el form es válido.
 */
export function validateCheckout(
  fields: CheckoutFields
): Partial<Record<keyof CheckoutFields, string>> {
  const e: Partial<Record<keyof CheckoutFields, string>> = {};

  if (!fields.name.trim()) e.name = "Requerido";

  if (!fields.whatsapp.trim()) e.whatsapp = "Requerido";
  else if (!/^\d{8,15}$/.test(fields.whatsapp.replace(/\s/g, "")))
    e.whatsapp = "Número inválido (solo dígitos, 8-15)";

  if (!fields.delivery) e.delivery = "Seleccioná un tipo de entrega";

  if (isInteriorDelivery(fields.delivery)) {
    if (!fields.provincia.trim()) e.provincia = "Requerido";
    if (!fields.ciudadEnvio.trim()) e.ciudadEnvio = "Requerido";
    if (!fields.address.trim())
      e.address = "Indicá calle, número, piso y código postal si podés";
  } else if (fields.delivery === "Retiro en sucursal") {
    if (!fields.localidad.trim()) e.localidad = "Requerido";
  } else if (fields.delivery === "Envío local") {
    if (!fields.localidad.trim()) e.localidad = "Requerido";
    if (!fields.address.trim())
      e.address = "La dirección es requerida para envío local";
  }

  return e;
}
