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
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1a1a2e]">Jugadores</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            {jugadores?.length || 0} jugadores registrados
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4af37]/10">
          <svg className="h-5 w-5 text-[#c9952a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
        </div>
      </div>

      {!jugadores || jugadores.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#d4af37]/10">
            <span className="text-3xl">👥</span>
          </div>
          <p className="text-lg font-medium text-[#1a1a2e]">No hay jugadores todavía</p>
          <p className="mt-1 text-sm text-[#6b7280]">
            Al registrarse con Google, aparecen acá
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {jugadores.map((j, i) => (
            <Link
              key={j.id}
              href={`/jugadores/${j.id}`}
              className="card-premium flex items-center gap-4 px-4 py-3.5 transition-all active:scale-[0.99] animate-slide-up"
              style={{ animationDelay: `${i * 30}ms` }}
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
                  <span className="rounded-full bg-[#d4af37]/10 px-3 py-0.5 text-xs font-medium text-[#a67c2e] capitalize">
                    {j.caracteristica_juego.replace(/_/g, " ")}
                  </span>
                )}
                {j.equipo_favorito && (
                  <span className="text-sm text-[#9ca3af] hidden sm:block">
                    {j.equipo_favorito}
                  </span>
                )}
                <svg className="h-4 w-4 text-[#d4af37]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
