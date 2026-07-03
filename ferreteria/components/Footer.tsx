import { Instagram, MapPin, Phone } from "lucide-react";
import { whatsAppUrl, WHATSAPP_BUSINESS_LABEL } from "@/lib/whatsapp";
import {
  STORE_ADDRESS,
  STORE_GOOGLE_MAPS_URL,
  STORE_INSTAGRAM_URL,
  STORE_NAME,
  STORE_SERVICE_AREA_TEXT,
} from "@/lib/siteConfig";

const STORE_INSTAGRAM_LABEL = "Ferretería González Hermanos";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 lg:px-8 sm:py-10">
        <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <div>
            <p className="font-semibold text-black">{STORE_NAME}</p>
            <p className="mt-0.5 text-sm text-gray-500">
              Todo lo que necesitas para tu obra
            </p>
            <p className="mt-0.5 text-sm text-gray-500">
              {STORE_SERVICE_AREA_TEXT}
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 sm:items-end">
            <a
              href={whatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors"
            >
              <Phone className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
              <span>WhatsApp: {WHATSAPP_BUSINESS_LABEL}</span>
            </a>
            <a
              href={STORE_GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors"
            >
              <MapPin className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
              <span>{STORE_ADDRESS} — Ver en Google Maps</span>
            </a>
            <a
              href={STORE_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors"
            >
              <Instagram
                className="h-4 w-4 shrink-0 text-gray-400"
                aria-hidden
              />
              <span>{STORE_INSTAGRAM_LABEL}</span>
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-400 sm:text-left">
          {"\u00A9"} {new Date().getFullYear()} {STORE_NAME}. Todos los derechos
          reservados.
        </p>

        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-center text-[10px] leading-snug text-gray-400">
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
        </div>
      </div>
    </footer>
  );
}
