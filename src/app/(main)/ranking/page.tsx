import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AvatarWithName } from "@/components/shared/AvatarWithName";
import { cn } from "@/lib/utils";
import { Trophy, Star, Goal, Medal, Users, ChevronRight, Swords } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const supabase = await createServerSupabaseClient();

  const { data: rankings } = await supabase
    .from("rankings")
    .select("*")
    .order("promedio_estrellas", { ascending: false });

  const porGoles = [...(rankings || [])].sort((a, b) => b.total_goles - a.total_goles);
  const porMVP = [...(rankings || [])].sort((a, b) => b.total_mvp - a.total_mvp);
  const porPartidos = [...(rankings || [])].sort((a, b) => b.partidos_jugados - a.partidos_jugados);

  const tabs = [
    { key: "estrellas", label: "Estrellas", icon: Star },
    { key: "goles", label: "Goleadores", icon: Goal },
    { key: "mvp", label: "MVP", icon: Medal },
    { key: "partidos", label: "Jugados", icon: Swords },
  ] as const;

  return (
    <div className="space-y-5 animate-fade-in pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Ranking</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Evaluación de jugadores
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-[#d4af37]" />
        </div>
      </div>

      {!rankings || rankings.length === 0 ? (
        <div className="card-dark rounded-2xl flex flex-col items-center py-16">
          <div className="mb-5 w-16 h-16 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-[#d4af37]/60" />
          </div>
          <p className="text-lg font-semibold text-foreground">Sin datos todavía</p>
          <p className="mt-1 text-sm text-muted-foreground text-center max-w-xs">
            Los rankings aparecen después de los primeros partidos finalizados
          </p>
        </div>
      ) : (
        <>
          {/* PODIUM - Top 3 */}
          <div className="card-dark rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#d4af37]" />
            <div className="p-5">
              <div className="flex items-center gap-2 mb-5">
                <Medal className="w-4 h-4 text-[#d4af37]" />
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Podio</h2>
              </div>
              {rankings.length >= 3 ? (
                <div className="flex items-end justify-center gap-3">
                  {/* 2do */}
                  <div className="flex flex-col items-center order-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#94a3b8] to-[#64748b] flex items-center justify-center mb-2 shadow-lg">
                      <span className="text-white font-black text-lg">2</span>
                    </div>
                    <AvatarWithName
                      name={rankings[1].nombre_completo}
                      fotoUrl={rankings[1].foto_url}
                      size="sm"
                      className="text-center"
                    />
                    <div className="flex items-center gap-0.5 mt-1">
                      <Star className="w-3 h-3 fill-[#d4af37] text-[#d4af37]" />
                      <span className="text-xs font-bold text-foreground">{rankings[1].promedio_estrellas.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* 1ro */}
                  <div className="flex flex-col items-center order-0 -mt-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8860b] flex items-center justify-center mb-2 shadow-lg animate-pulse-glow">
                        <span className="text-white font-black text-2xl">1</span>
                      </div>
                      <Trophy className="absolute -top-2 -right-2 w-6 h-6 text-[#d4af37]" />
                    </div>
                    <AvatarWithName
                      name={rankings[0].nombre_completo}
                      fotoUrl={rankings[0].foto_url}
                      size="sm"
                      className="text-center"
                    />
                    <div className="flex items-center gap-0.5 mt-1">
                      <Star className="w-3.5 h-3.5 fill-[#d4af37] text-[#d4af37]" />
                      <span className="text-sm font-black text-foreground">{rankings[0].promedio_estrellas.toFixed(1)}</span>
                    </div>
                    {rankings[0].total_mvp > 0 && (
                      <span className="text-[10px] font-bold text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded-full mt-1">
                        {rankings[0].total_mvp}x MVP
                      </span>
                    )}
                  </div>

                  {/* 3ro */}
                  <div className="flex flex-col items-center order-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d97706] to-[#b45309] flex items-center justify-center mb-2 shadow-lg">
                      <span className="text-white font-black text-lg">3</span>
                    </div>
                    <AvatarWithName
                      name={rankings[2].nombre_completo}
                      fotoUrl={rankings[2].foto_url}
                      size="sm"
                      className="text-center"
                    />
                    <div className="flex items-center gap-0.5 mt-1">
                      <Star className="w-3 h-3 fill-[#d4af37] text-[#d4af37]" />
                      <span className="text-xs font-bold text-foreground">{rankings[2].promedio_estrellas.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Se necesitan al menos 3 jugadores con datos</p>
              )}
            </div>
          </div>

          {/* Tabs: Estrellas / Goles / MVP / Partidos */}
          <div className="card-dark rounded-2xl overflow-hidden">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-5">
                <Users className="w-4 h-4 text-[#d4af37]" />
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Tabla de Jugadores</h2>
              </div>

              <div className="space-y-2">
                {rankings.map((r, i) => (
                  <Link
                    key={r.jugador_id}
                    href={`/jugadores/${r.jugador_id}`}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-[#d4af37]/20 transition-all group"
                  >
                    <span className={cn(
                      "w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0",
                      i === 0 ? "bg-[#d4af37] text-black" :
                      i === 1 ? "bg-[#94a3b8] text-white" :
                      i === 2 ? "bg-[#d97706] text-white" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {i + 1}
                    </span>

                    <AvatarWithName
                      name={r.nombre_completo}
                      fotoUrl={r.foto_url}
                      size="sm"
                      className="flex-1 min-w-0"
                    />

                    {/* Stats row */}
                    <div className="flex items-center gap-2 text-xs font-medium shrink-0">
                      <span className="flex items-center gap-0.5 text-foreground">
                        <Star className="w-3 h-3 fill-[#d4af37] text-[#d4af37]" />
                        {r.promedio_estrellas.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-0.5 text-foreground">
                        <Goal className="w-3 h-3 text-emerald-400" />
                        {r.total_goles}
                      </span>
                      {r.total_mvp > 0 && (
                        <span className="text-[#d4af37] font-semibold">{r.total_mvp}xMVP</span>
                      )}
                    </div>

                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
