import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AvatarWithName } from "@/components/shared/AvatarWithName";

export const dynamic = "force-dynamic";

export default async function JugadoresPage() {
  const supabase = await createServerSupabaseClient();

  const { data: jugadoresRaw } = await supabase
    .from("jugadores")
    .select("*")
    .order("nombre_completo", { ascending: true });

  const jugadores = (jugadoresRaw || []) as unknown as {
    id: string;
    nombre_completo: string;
    foto_url: string | null;
    numero_dorsal: number | null;
    equipo_favorito: string | null;
    caracteristica_juego: string | null;
  }[];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Jugadores</h1>

      <p className="text-sm text-gray-500">
        {jugadores?.length || 0} jugadores registrados
      </p>

      {!jugadores || jugadores.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-gray-400">
          <p className="text-lg">No hay jugadores todavía</p>
          <p className="mt-1 text-sm">
            Al registrarse con Google, aparecen acá
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {jugadores.map((j) => (
            <Link
              key={j.id}
              href={`/jugadores/${j.id}`}
              className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm transition-all active:scale-[0.99]"
            >
              <AvatarWithName
                name={j.nombre_completo}
                fotoUrl={j.foto_url}
                dorsal={j.numero_dorsal}
                showDorsal
                size="md"
              />
              <div className="ml-auto flex items-center gap-2">
                {j.caracteristica_juego && (
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                    {j.caracteristica_juego}
                  </span>
                )}
                {j.equipo_favorito && (
                  <span className="text-sm text-gray-400">
                    {j.equipo_favorito}
                  </span>
                )}
                <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
