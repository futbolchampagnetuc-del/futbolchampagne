import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AvatarWithName } from "@/components/shared/AvatarWithName";
import { StarRating } from "@/components/shared/StarRating";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const supabase = await createServerSupabaseClient();

  // Obtener rankings de la vista materializada
  const { data: rankings } = await supabase
    .from("rankings")
    .select("*")
    .order("total_goles", { ascending: false });

  // Top goleadores (ordenado por goles)
  const topGoleadores = rankings?.slice(0, 10) || [];

  // Stats generales (ordenado por rating)
  const porRating = [...(rankings || [])].sort(
    (a, b) => b.promedio_estrellas - a.promedio_estrellas
  );

  // Más partidos jugados
  const masJugados = [...(rankings || [])].sort(
    (a, b) => b.partidos_jugados - a.partidos_jugados
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1a1a2e]">Ranking</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Estadísticas y posiciones
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4af37]/10">
          <svg className="h-5 w-5 text-[#c9952a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
        </div>
      </div>

      {!rankings || rankings.length === 0 ? (
        <div className="card-premium flex flex-col items-center py-16">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#d4af37]/10">
            <span className="text-3xl">🏆</span>
          </div>
          <p className="text-lg font-semibold text-[#1a1a2e]">Sin datos todavía</p>
          <p className="mt-1 text-sm text-[#6b7280]">
            Los rankings aparecen después de los primeros partidos
          </p>
        </div>
      ) : (
        <>
          {/* Top Goleadores */}
          <section className="animate-slide-up">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4af37]/10">
                <span className="text-base">⚽</span>
              </div>
              <h2 className="text-lg font-bold text-[#1a1a2e]">Goleadores</h2>
            </div>
            <div className="space-y-2">
              {topGoleadores.map((r, i) => (
                <div
                  key={r.jugador_id}
                  className="card-premium flex items-center gap-3 px-4 py-3 animate-slide-up"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold shadow-sm",
                      i === 0
                        ? "bg-gradient-to-br from-[#d4af37] to-[#b8860b] text-white"
                        : i === 1
                          ? "bg-gradient-to-br from-[#94a3b8] to-[#64748b] text-white"
                          : i === 2
                            ? "bg-gradient-to-br from-[#d97706] to-[#b45309] text-white"
                            : "bg-[#f0ede6] text-[#6b7280]"
                    )}
                  >
                    {i + 1}
                  </span>
                  <AvatarWithName
                    name={r.nombre_completo}
                    fotoUrl={r.foto_url}
                    size="sm"
                    className="flex-1"
                  />
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-[#1a1a2e]">
                      {r.total_goles}
                    </span>
                    <span className="ml-1 text-xs text-[#6b7280]">goles</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="divider-champagne" />

          {/* Por Rating */}
          <section className="animate-slide-up">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4af37]/10">
                <span className="text-base">⭐</span>
              </div>
              <h2 className="text-lg font-bold text-[#1a1a2e]">Mejor Valorados</h2>
            </div>
            <div className="space-y-2">
              {porRating.slice(0, 5).map((r) => (
                <div
                  key={r.jugador_id}
                  className="card-premium flex items-center gap-3 px-4 py-3"
                >
                  <AvatarWithName
                    name={r.nombre_completo}
                    fotoUrl={r.foto_url}
                    size="sm"
                    className="flex-1"
                  />
                  <div className="text-right">
                    <StarRating value={r.promedio_estrellas} readonly size="sm" />
                    <p className="text-xs text-[#6b7280] mt-0.5">
                      {r.total_votos_recibidos} votos
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="divider-champagne" />

          {/* Tabla completa */}
          <section className="animate-slide-up">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4af37]/10">
                <span className="text-base">📊</span>
              </div>
              <h2 className="text-lg font-bold text-[#1a1a2e]">Estadísticas Completas</h2>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#e5e0d8]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-[#f5f0e6] to-[#faf8f5]">
                    <th className="px-3 py-3 text-left font-semibold text-[#6b7280]">Jugador</th>
                    <th className="px-3 py-3 text-center font-semibold text-[#6b7280]">PJ</th>
                    <th className="px-3 py-3 text-center font-semibold text-[#6b7280]">G</th>
                    <th className="px-3 py-3 text-center font-semibold text-[#6b7280]">E</th>
                    <th className="px-3 py-3 text-center font-semibold text-[#6b7280]">P</th>
                    <th className="px-3 py-3 text-center font-semibold text-[#6b7280]">⚽</th>
                    <th className="px-3 py-3 text-center font-semibold text-[#6b7280]">⭐</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((r, i) => (
                    <tr
                      key={r.jugador_id}
                      className="border-t border-[#e5e0d8]/60 transition-colors hover:bg-[#faf8f5]"
                    >
                      <td className="px-3 py-2.5">
                        <AvatarWithName
                          name={r.nombre_completo}
                          fotoUrl={r.foto_url}
                          size="sm"
                        />
                      </td>
                      <td className="px-3 py-2.5 text-center font-semibold text-[#1a1a2e]">{r.partidos_jugados}</td>
                      <td className="px-3 py-2.5 text-center font-semibold text-[#0d9488]">{r.partidos_ganados}</td>
                      <td className="px-3 py-2.5 text-center font-semibold text-[#d4af37]">{r.partidos_empatados}</td>
                      <td className="px-3 py-2.5 text-center font-semibold text-[#dc2626]">{r.partidos_perdidos}</td>
                      <td className="px-3 py-2.5 text-center font-bold text-[#1a1a2e]">{r.total_goles}</td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <span className="text-[#d4af37]">★</span>
                          <span className="text-sm font-bold text-[#1a1a2e]">
                            {r.promedio_estrellas.toFixed(1)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
