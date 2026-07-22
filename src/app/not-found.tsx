import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <div className="mb-4 text-6xl">🤷</div>
      <h1 className="text-2xl font-bold text-gray-900">Página no encontrada</h1>
      <p className="mt-2 text-gray-500">La página que buscas no existe</p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-sm"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
