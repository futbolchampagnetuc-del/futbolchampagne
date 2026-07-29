import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#b8860b]/10">
        <span className="text-4xl">🤷</span>
      </div>
      <h1 className="text-2xl font-extrabold text-foreground">Página no encontrada</h1>
      <p className="mt-2 text-muted-foreground">La página que buscas no existe</p>
      <Link
        href="/"
        className="btn-primary mt-8"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Volver al inicio
      </Link>
    </div>
  );
}
