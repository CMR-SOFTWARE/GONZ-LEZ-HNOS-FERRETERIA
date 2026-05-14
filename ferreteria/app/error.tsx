"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
      <h2 className="text-lg font-semibold text-red-800">Algo salió mal</h2>
      <p className="mt-2 text-sm text-red-700">{error.message}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
      >
        Reintentar
      </button>
    </div>
  );
}
