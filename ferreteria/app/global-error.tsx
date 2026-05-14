"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6 font-sans text-black">
        <div className="max-w-md rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-bold text-red-800">Error en la aplicación</h1>
          <p className="mt-2 text-sm text-gray-600">{error.message}</p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
