/** Solo dígitos, sin + ni espacios (wa.me / API de WhatsApp). */
export const WHATSAPP_BUSINESS_DIGITS = "5493364006408";

/** Texto legible para la web (mismo número que +5493364006408). */
export const WHATSAPP_BUSINESS_LABEL = "+54 9 336 400-6408";

export function whatsAppUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_BUSINESS_DIGITS}`;
  if (message && message.trim().length > 0) {
    return `${base}?text=${encodeURIComponent(message)}`;
  }
  return base;
}
