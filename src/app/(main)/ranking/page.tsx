import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AvatarWithName } from "@/components/shared/AvatarWithName";
import { StarRating } from "@/components/shared/StarRating";

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Ranking</h1>

      {!rankings || rankings.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-gray-400">
          <div className="mb-3 text-5xl">🏆</div>
          <p className="text-lg font-medium">Sin datos todavía</p>
          <p className="mt-1 text-sm">
            Los rankings aparecen después de los primeros partidos
          </p>
        </div>
      ) : (
        <>
          {/* Top Goleadores */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl">⚽</span>
              <h2 className="text-lg font-semibold text-gray-900">
                Goleadores
              </h2>
            </div>
            <div className="space-y-2">
              {topGoleadores.map((r, i) => (
                <div
                  key={r.jugador_id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                      i === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : i === 1
                          ? "bg-gray-200 text-gray-600"
                          : i === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-500"
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
                  <span className="text-lg font-bold text-gray-900">
                    {r.total_goles}
                  </span>
                  <span className="text-xs text-gray-400">goles</span>
                </div>
              ))}
            </div>
          </section>

          {/* Por Rating */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <h2 className="text-lg font-semibold text-gray-900">
                Mejor Valorados
              </h2>
            </div>
            <div className="space-y-2">
              {porRating.slice(0, 5).map((r) => (
                <div
                  key={r.jugador_id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
                >
                  <AvatarWithName
                    name={r.nombre_completo}
                    fotoUrl={r.foto_url}
                    size="sm"
                    className="flex-1"
                  />
                  <div className="text-right">
                    <StarRating value={r.promedio_estrellas} readonly size="sm" />
                    <p className="text-xs text-gray-400">
                      {r.total_votos_recibidos} votos
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tabla completa */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl">📊</span>
              <h2 className="text-lg font-semibold text-gray-900">
                Estadísticas Completas
              </h2>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600">
                      Jugador
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-600">
                      PJ
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-600">
                      G
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-600">
                      E
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-600">
                      P
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-600">
                      ⚽
                    </th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-600">
                      ⭐
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((r) => (
                    <tr
                      key={r.jugador_id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="px-3 py-2.5">
                        <AvatarWithName
                          name={r.nombre_completo}
                          fotoUrl={r.foto_url}
                          size="sm"
                        />
                      </td>
                      <td className="px-3 py-2.5 text-center font-medium">
                        {r.partidos_jugados}
                      </td>
                      <td className="px-3 py-2.5 text-center font-medium text-green-600">
                        {r.partidos_ganados}
                      </td>
                      <td className="px-3 py-2.5 text-center font-medium text-yellow-600">
                        {r.partidos_empatados}
                      </td>
                      <td className="px-3 py-2.5 text-center font-medium text-red-600">
                        {r.partidos_perdidos}
                      </td>
                      <td className="px-3 py-2.5 text-center font-bold text-gray-900">
                        {r.total_goles}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm font-medium">
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

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}
