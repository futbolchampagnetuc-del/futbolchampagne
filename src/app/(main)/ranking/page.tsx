import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AvatarWithName } from "@/components/shared/AvatarWithName";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const supabase = await createServerSupabaseClient();

  // Obtener rankings de la vista materializada
  const { data: rankings } = await supabase
    .from("rankings")
    .select("*")
    .order("total_goles", { ascending: false });

  // Stats generales (ordenado por rating descendente)
  const porRating = [...(rankings || [])].sort(
    (a, b) => b.promedio_estrellas - a.promedio_estrellas
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
        <div className="space-y-3">
          {porRating.map((r, i) => (
            <div
              key={r.jugador_id}
              className="card-premium flex items-center gap-4 px-5 py-4 animate-slide-up"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm",
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
                size="md"
                className="flex-1 min-w-0"
              />
              
              <div className="text-right shrink-0">
                <div className="flex items-center justify-end gap-1.5 mb-1">
                  <span className="text-[#d4af37] text-lg">★</span>
                  <span className="text-xl font-extrabold text-[#1a1a2e]">
                    {r.promedio_estrellas.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-[#6b7280]">
                  {r.total_votos_recibidos} votos
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
