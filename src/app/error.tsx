"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <div className="mb-4 text-6xl">😵</div>
      <h1 className="text-2xl font-bold text-gray-900">Algo salió mal</h1>
      <p className="mt-2 text-gray-500">{error.message || "Error inesperado"}</p>
      <button
        onClick={reset}
        className="mt-6 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-sm"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
