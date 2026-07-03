import { WHATSAPP_BUSINESS_DIGITS, WHATSAPP_BUSINESS_LABEL } from "@/lib/whatsapp";

export const SITE_URL = "https://ferreteriagonzalezhnos.com";

export const STORE_NAME = "González Hnos Ferretería";
export const STORE_CITY = "San Nicolás de los Arroyos";
export const STORE_STREET_ADDRESS = "Alberdi 302, Esquina San Martín";
export const STORE_ADDRESS = `${STORE_STREET_ADDRESS}, ${STORE_CITY}`;
export const STORE_POSTAL_CODE = "2900";
export const STORE_REGION = "Buenos Aires";
export const STORE_COUNTRY = "AR";
export const STORE_PHONE = WHATSAPP_BUSINESS_LABEL;
export const STORE_PHONE_E164 = `+${WHATSAPP_BUSINESS_DIGITS}`;
export const STORE_INSTAGRAM_URL =
  "https://www.instagram.com/ferreteriagonzalezhermanos?igsh=a2t1OHdpbW1yanht";
/** Ficha exacta de Google Maps (por CID), usada en el JSON-LD (hasMap) para que Google
 * asocie el sitio con el perfil de Maps sin ambigüedad. */
export const STORE_GOOGLE_MAPS_URL = "https://maps.google.com/?cid=470090258122455955";

export const STORE_SEO_TITLE = `Ferretería en San Nicolás | ${STORE_NAME}`;
export const STORE_SEO_DESCRIPTION =
  "Ferretería en San Nicolás de los Arroyos: herramientas, electricidad, plomería, pinturas y más. Catálogo online con pedidos y envíos por WhatsApp.";
export const STORE_SERVICE_AREA_TEXT = "Envíos a San Nicolás de los Arroyos y alrededores.";

/** Horario de atención, usado en el JSON-LD LocalBusiness y en la web. */
export const STORE_OPENING_HOURS = [
  { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "13:00" },
  { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "15:30", closes: "16:30" },
  { days: ["Saturday"], opens: "09:00", closes: "13:00" },
];
