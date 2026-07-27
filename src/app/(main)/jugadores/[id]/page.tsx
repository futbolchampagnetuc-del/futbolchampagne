import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StarRating } from "@/components/shared/StarRating";
import { HabilidadesRadar } from "@/components/features/perfil/HabilidadesRadar";
import { ArrowLeft, ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function JugadorDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Obtener jugador
  const { data: jugadorRaw } = await supabase
    .from("jugadores")
    .select("*")
    .eq("id", id)
    .single();

  if (!jugadorRaw) notFound();

  const jugador = jugadorRaw as any;

  // Obtener habilidades
  const { data: habilidadesRaw } = await supabase
    .from("jugador_habilidades")
    .select("*")
    .eq("jugador_id", id)
    .single();
    
  const habilidades = habilidadesRaw || {};

  // Obtener rating promedio
  const { data: evaluacionesRaw } = await supabase
    .from("evaluaciones")
    .select("estrellas")
    .eq("evaluado_id", id);

  const evaluaciones = (evaluacionesRaw || []) as { estrellas: number }[];
  const promedioEstrellas =
    evaluaciones.length > 0
      ? evaluaciones.reduce((sum, e) => sum + e.estrellas, 0) /
        evaluaciones.length
      : 0;

  // Obtener estadísticas del ranking
  const { data: rankingRaw } = await supabase
    .from("rankings")
    .select("*")
    .eq("jugador_id", id)
    .single();

  const ranking = rankingRaw as any;

  // Calcular edad
  let edadTexto = "—";
  if (jugador.fecha_nacimiento) {
    const nac = new Date(jugador.fecha_nacimiento);
    const hoy = new Date();
    let edadCalc = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
      edadCalc--;
    }
    edadTexto = `${edadCalc} años`;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <Link href="/jugadores" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="h-4 w-4" />
        Todos los jugadores
      </Link>

      {/* Header con foto */}
      <div className="rounded-2xl border border-border bg-card flex flex-col items-center py-8 px-6 shadow-sm relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

        <div className="relative z-10">
          {jugador.foto_url ? (
            <img
              src={jugador.foto_url}
              alt={jugador.nombre_completo}
              className="h-28 w-28 rounded-full object-cover shadow-sm ring-4 ring-background"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-accent text-3xl font-bold text-accent-foreground shadow-sm ring-4 ring-background">
              {jugador.nombre_completo
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
          )}
          {jugador.numero_dorsal && (
            <span className="absolute -bottom-2 -right-2 flex h-8 min-w-[32px] items-center justify-center rounded-full bg-primary px-2.5 text-sm font-bold text-primary-foreground shadow-sm ring-2 ring-background">
              #{jugador.numero_dorsal}
            </span>
          )}
        </div>

        <h1 className="mt-5 text-2xl font-extrabold text-foreground text-center">
          {jugador.nombre_completo}
        </h1>

        <div className="mt-2 flex flex-wrap gap-2 justify-center">
          {jugador.posiciones?.map((pos: string) => (
             <span key={pos} className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
               {pos}
             </span>
          ))}
        </div>

        {/* Rating */}
        <div className="mt-4 flex items-center gap-2 bg-background border border-border rounded-full px-4 py-1.5 shadow-sm">
          <StarRating value={promedioEstrellas} readonly size="sm" />
          <span className="text-sm font-medium text-muted-foreground">
            ({evaluaciones?.length || 0} votos)
          </span>
        </div>
      </div>

      {/* Características */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-5 text-lg font-bold text-foreground">Características</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Altura", value: jugador.altura ? `${jugador.altura} cm` : "—" },
            { label: "Peso", value: jugador.peso ? `${jugador.peso} kg` : "—" },
            { label: "Edad", value: edadTexto },
            { label: "Pie hábil", value: jugador.pie_habil?.join(", ") || "—", capitalize: true },
            { label: "Talle", value: jugador.talle_camiseta || "—", capitalize: true },
            { label: "Estilo", value: jugador.caracteristica_juego?.replace(/_/g, " ") || "—", capitalize: true },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-accent/50 p-3.5 border border-border/50">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</p>
              <p className={`font-medium text-foreground mt-1 text-sm ${item.capitalize ? "capitalize" : ""}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {jugador.equipo_favorito && (
          <div className="mt-3 rounded-xl bg-accent/50 p-3.5 border border-border/50 flex items-center gap-3">
             {jugador.escudo_equipo_url && (
               <img src={jugador.escudo_equipo_url} alt="Escudo" className="w-8 h-8 object-contain" />
             )}
             <div>
               <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Equipo Favorito</p>
               <p className="font-medium text-foreground text-sm">{jugador.equipo_favorito}</p>
             </div>
          </div>
        )}
      </div>

      {/* Radar de Habilidades */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-2 text-lg font-bold text-foreground">Perfil Técnico</h2>
        <p className="text-sm text-muted-foreground mb-6">Atributos evaluados por el jugador y la comunidad.</p>
        <div className="-ml-4 -mr-4">
          <HabilidadesRadar habilidades={habilidades} />
        </div>
      </div>

      {/* Estadísticas */}
      {ranking && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="h-1 bg-primary" />
          <div className="p-5">
            <h2 className="mb-5 text-lg font-bold text-foreground">Estadísticas</h2>
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-xl border border-border bg-background p-3 text-center">
                <p className="text-2xl font-extrabold text-primary">{ranking.partidos_jugados}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">PJ</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-3 text-center">
                <p className="text-2xl font-extrabold text-emerald-500">{ranking.total_goles}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">Goles</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-3 text-center">
                <p className="text-2xl font-extrabold text-blue-500">{ranking.partidos_ganados}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">PG</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-3 text-center">
                <p className="text-2xl font-extrabold text-destructive">{ranking.partidos_perdidos}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">PP</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
