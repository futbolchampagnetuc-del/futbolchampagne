import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AvatarWithName } from "@/components/shared/AvatarWithName";
import { Users, ChevronRight, Swords } from "lucide-react";

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
          <h1 className="text-2xl font-black tracking-tight text-foreground">Jugadores</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {jugadores?.length || 0} jugadores registrados
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-[#d4af37]" />
        </div>
      </div>

      {!jugadores || jugadores.length === 0 ? (
        <div className="card-dark rounded-2xl flex flex-col items-center py-16">
          <div className="mb-5 w-16 h-16 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
            <Users className="w-8 h-8 text-[#d4af37]/60" />
          </div>
          <p className="text-lg font-semibold text-foreground">No hay jugadores todavía</p>
          <p className="mt-1 text-sm text-muted-foreground">Agregá jugadores desde el panel admin</p>
        </div>
      ) : (
        <div className="space-y-2">
          {jugadores.map((j, i) => (
            <Link
              key={j.id}
              href={`/jugadores/${j.id}`}
              className="card-dark rounded-2xl flex items-center gap-4 px-4 py-3.5 transition-all hover:border-[#d4af37]/30 active:scale-[0.99] animate-slide-up"
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
                  <span className="rounded-full bg-[#d4af37]/10 px-3 py-0.5 text-xs font-semibold text-[#d4af37] capitalize">
                    {j.caracteristica_juego.replace(/_/g, " ")}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
