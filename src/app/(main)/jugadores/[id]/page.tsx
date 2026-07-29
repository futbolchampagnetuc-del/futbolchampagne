import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StarRating } from "@/components/shared/StarRating";
import { HabilidadesRadar } from "@/components/features/perfil/HabilidadesRadar";
import { EditJugadorForm } from "@/components/features/perfil/EditJugadorForm";
import { MatchHistory } from "@/components/features/perfil/MatchHistory";
import { PlayerReviews } from "@/components/features/perfil/PlayerReviews";
import { ChevronLeft, Star, Swords, MessageSquare, Trophy, Goal, Users, Ruler, Weight, Cake, Footprints, Shirt, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function JugadorDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: jugadorRaw } = await supabase
    .from("jugadores")
    .select("*")
    .eq("id", id)
    .single();

  if (!jugadorRaw) notFound();

  const jugador = jugadorRaw as any;

  const { data: habilidadesRaw } = await supabase
    .from("jugador_habilidades")
    .select("*")
    .eq("jugador_id", id)
    .single();
  const habilidades = habilidadesRaw || {};

  const { data: evaluacionesRaw } = await supabase
    .from("evaluaciones")
    .select("estrellas")
    .eq("evaluado_id", id);
  const evaluaciones = (evaluacionesRaw || []) as { estrellas: number }[];
  const promedioEstrellas = evaluaciones.length > 0
    ? evaluaciones.reduce((sum, e) => sum + e.estrellas, 0) / evaluaciones.length
    : 0;

  const { data: rankingRaw } = await supabase
    .from("rankings")
    .select("*")
    .eq("jugador_id", id)
    .single();
  const ranking = rankingRaw as any;

  let edadTexto = "—";
  if (jugador.fecha_nacimiento) {
    const nac = new Date(jugador.fecha_nacimiento);
    const hoy = new Date();
    let edadCalc = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edadCalc--;
    edadTexto = `${edadCalc} años`;
  }

  const stats = [
    { label: "Altura", value: jugador.altura ? `${jugador.altura} cm` : "—", icon: Ruler, color: "text-blue-400" },
    { label: "Peso", value: jugador.peso ? `${jugador.peso} kg` : "—", icon: Weight, color: "text-emerald-400" },
    { label: "Edad", value: edadTexto, icon: Cake, color: "text-purple-400" },
    { label: "Pie", value: jugador.pie_habil?.join(", ") || "—", icon: Footprints, color: "text-amber-400" },
    { label: "Talle", value: jugador.talle_camiseta || "—", icon: Shirt, color: "text-rose-400" },
    { label: "Estilo", value: jugador.caracteristica_juego?.replace(/_/g, " ") || "—", icon: Zap, color: "text-cyan-400" },
  ];

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      <Link href="/jugadores" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="h-4 w-4" />
        Todos los jugadores
      </Link>

      {/* Profile Card */}
      <div className="relative overflow-hidden rounded-2xl card-dark p-6 pt-8">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#d4af37]/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          {jugador.foto_url ? (
            <img src={jugador.foto_url} alt={jugador.nombre_completo}
              className="h-24 w-24 rounded-full object-cover shadow-lg ring-4 ring-[#d4af37]/20" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#b8860b]/10 text-2xl font-bold text-[#d4af37] shadow-lg ring-4 ring-[#d4af37]/20">
              {jugador.nombre_completo.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </div>
          )}
          {jugador.numero_dorsal && (
            <span className="absolute -bottom-1 right-1/2 translate-x-20 flex h-8 min-w-[32px] items-center justify-center rounded-full bg-[#d4af37] px-2.5 text-sm font-bold text-black shadow-lg ring-2 ring-background">
              #{jugador.numero_dorsal}
            </span>
          )}
          <h1 className="mt-4 text-2xl font-black text-foreground text-center">{jugador.nombre_completo}</h1>
          <div className="mt-2 flex flex-wrap gap-2 justify-center">
            {jugador.posiciones?.map((pos: string) => (
              <span key={pos} className="rounded-full bg-[#d4af37]/10 px-3 py-1 text-xs font-semibold text-[#d4af37]">
                {pos}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-1.5 bg-muted/50 border border-border rounded-full px-4 py-1.5">
            <StarRating value={promedioEstrellas} readonly size="sm" />
            <span className="text-xs font-medium text-muted-foreground">({evaluaciones?.length || 0})</span>
          </div>
          <div className="mt-4">
            <EditJugadorForm jugador={jugador} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="rounded-2xl card-dark p-5">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-[#d4af37]" />
          Características
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl bg-muted/50 p-3 border border-border/50">
              <Icon className={`w-4 h-4 ${color} mb-1.5`} />
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className="font-semibold text-foreground text-sm mt-0.5">{value}</p>
            </div>
          ))}
        </div>
        {jugador.equipo_favorito && (
          <div className="mt-3 rounded-xl bg-muted/50 p-3.5 border border-border/50 flex items-center gap-3">
            {jugador.escudo_equipo_url && (
              <img src={jugador.escudo_equipo_url} alt="Escudo" className="w-8 h-8 object-contain" />
            )}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Equipo Favorito</p>
              <p className="font-semibold text-foreground text-sm">{jugador.equipo_favorito}</p>
            </div>
          </div>
        )}
      </div>

      {/* Radar */}
      <div className="rounded-2xl card-dark p-5">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-1">Perfil Técnico</h2>
        <p className="text-xs text-muted-foreground mb-4">Atributos evaluados por el jugador y la comunidad</p>
        <HabilidadesRadar habilidades={habilidades} />
      </div>

      {/* Estadísticas */}
      {ranking && (
        <div className="rounded-2xl card-dark overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#d4af37] to-[#f0d060]" />
          <div className="p-5">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#d4af37]" />
              Estadísticas
            </h2>
            <div className="grid grid-cols-4 gap-2.5">
              <div className="rounded-xl bg-muted/50 border border-border/50 p-3 text-center">
                <p className="text-2xl font-black text-foreground">{ranking.partidos_jugados}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">PJ</p>
              </div>
              <div className="rounded-xl bg-muted/50 border border-border/50 p-3 text-center">
                <p className="text-2xl font-black text-emerald-400">{ranking.total_goles}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">Goles</p>
              </div>
              <div className="rounded-xl bg-muted/50 border border-border/50 p-3 text-center">
                <p className="text-2xl font-black text-blue-400">{ranking.partidos_ganados}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">PG</p>
              </div>
              <div className="rounded-xl bg-muted/50 border border-border/50 p-3 text-center">
                <p className="text-2xl font-black text-red-400">{ranking.partidos_perdidos}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">PP</p>
              </div>
            </div>
            {ranking.promedio_estrellas > 0 && (
              <div className="mt-3 flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted/50 border border-border/50">
                <span className="text-xs font-semibold text-muted-foreground">Rating Promedio</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black text-foreground">{ranking.promedio_estrellas.toFixed(1)}</span>
                  <Star className="w-4 h-4 fill-[#d4af37] text-[#d4af37]" />
                  <span className="text-xs text-muted-foreground">({ranking.total_votos_recibidos} votos)</span>
                </div>
              </div>
            )}
            {ranking.total_mvp > 0 && (
              <div className="mt-2 flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#d4af37]/5 border border-[#d4af37]/20">
                <span className="text-xs font-semibold text-[#d4af37]">MVP Awards</span>
                <span className="text-lg font-black text-[#d4af37]">{ranking.total_mvp}x</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historial de Partidos */}
      <div className="rounded-2xl card-dark p-5">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Swords className="w-4 h-4 text-[#d4af37]" />
          Historial de Partidos
        </h2>
        <MatchHistory jugadorId={id} />
      </div>

      {/* Reseñas */}
      <div className="rounded-2xl card-dark p-5">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#d4af37]" />
          Reseñas Recibidas
        </h2>
        <PlayerReviews jugadorId={id} />
      </div>
    </div>
  );
}
