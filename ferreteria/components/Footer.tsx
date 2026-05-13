import { Phone } from "lucide-react";

const STORE_NAME = "GONZ\u00C1LEZ-HNOS FERRETERIA";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <div>
            <p className="font-semibold text-black">{STORE_NAME}</p>
            <p className="mt-0.5 text-sm text-gray-500">
              Todo lo que necesitas para tu obra
            </p>
          </div>
          <p className="inline-flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            <span>Contacto: +54 9 11 1234-5678</span>
          </p>
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
