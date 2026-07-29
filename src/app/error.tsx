"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#b8860b]/10">
        <span className="text-4xl">😵</span>
      </div>
      <h1 className="text-2xl font-extrabold text-foreground">Algo salió mal</h1>
      <p className="mt-2 text-muted-foreground max-w-sm">
        {error.message || "Error inesperado"}
      </p>
      <button
        onClick={reset}
        className="btn-primary mt-8"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
        </svg>
        Intentar de nuevo
      </button>
    </div>
  );
}
