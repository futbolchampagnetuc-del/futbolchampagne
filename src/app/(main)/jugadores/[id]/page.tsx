import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StarRating } from "@/components/shared/StarRating";

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
    .eq("id", id);

  const jugador = (jugadorRaw && jugadorRaw.length > 0
    ? jugadorRaw[0]
    : null) as unknown as {
    id: string;
    nombre_completo: string;
    email: string;
    foto_url: string | null;
    altura: number | null;
    peso: number | null;
    edad: number | null;
    pie_habil: string | null;
    numero_dorsal: number | null;
    equipo_favorito: string | null;
    caracteristica_juego: string | null;
    escudo_equipo_url: string | null;
    created_at: string;
    updated_at: string;
  } | null;

  if (!jugador) notFound();

  // Obtener rating promedio
  const { data: evaluacionesRaw } = await supabase
    .from("evaluaciones")
    .select("estrellas")
    .eq("evaluado_id", id);

  const evaluaciones = (evaluacionesRaw || []) as unknown as { estrellas: number }[];
  const promedioEstrellas =
    evaluaciones.length > 0
      ? evaluaciones.reduce((sum, e) => sum + e.estrellas, 0) /
        evaluaciones.length
      : 0;

  // Obtener estadísticas del ranking
  const { data: rankingRaw } = await supabase
    .from("rankings")
    .select("*")
    .eq("jugador_id", id);

  const ranking = (rankingRaw && rankingRaw.length > 0
    ? rankingRaw[0]
    : null) as unknown as {
    jugador_id: string;
    nombre_completo: string;
    foto_url: string | null;
    partidos_jugados: number;
    partidos_ganados: number;
    partidos_perdidos: number;
    partidos_empatados: number;
    total_goles: number;
    promedio_estrellas: number;
    total_votos_recibidos: number;
  } | null;

  return (
    <div className="space-y-6">
      {/* Header con foto */}
      <div className="flex flex-col items-center py-4">
        {jugador.foto_url ? (
          <img
            src={jugador.foto_url}
            alt={jugador.nombre_completo}
            className="h-24 w-24 rounded-full object-cover shadow-md"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-700 shadow-md">
            {jugador.nombre_completo
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
        )}

        <h1 className="mt-3 text-xl font-bold text-gray-900">
          {jugador.nombre_completo}
        </h1>

        {jugador.numero_dorsal && (
          <span className="mt-1 rounded-full bg-green-600 px-3 py-0.5 text-sm font-bold text-white">
            #{jugador.numero_dorsal}
          </span>
        )}

        {/* Rating */}
        <div className="mt-3 flex items-center gap-2">
          <StarRating value={promedioEstrellas} readonly size="md" />
          <span className="text-sm text-gray-500">
            ({evaluaciones?.length || 0} votos)
          </span>
        </div>
      </div>

      {/* Características */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Características
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Altura</p>
            <p className="font-medium text-gray-800">
              {jugador.altura ? `${jugador.altura} cm` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Peso</p>
            <p className="font-medium text-gray-800">
              {jugador.peso ? `${jugador.peso} kg` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Edad</p>
            <p className="font-medium text-gray-800">
              {jugador.edad ? `${jugador.edad} años` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Pie hábil</p>
            <p className="font-medium capitalize text-gray-800">
              {jugador.pie_habil || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Característica</p>
            <p className="font-medium capitalize text-gray-800">
              {jugador.caracteristica_juego || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Equipo favorito</p>
            <p className="font-medium text-gray-800">
              {jugador.equipo_favorito || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {ranking && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Estadísticas
          </h2>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-2xl font-bold text-blue-600">
                {ranking.partidos_jugados}
              </p>
              <p className="text-xs text-gray-500">Jugados</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <p className="text-2xl font-bold text-green-600">
                {ranking.total_goles}
              </p>
              <p className="text-xs text-gray-500">Goles</p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-3">
              <p className="text-2xl font-bold text-yellow-600">
                {ranking.partidos_ganados}
              </p>
              <p className="text-xs text-gray-500">Ganados</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-2xl font-bold text-red-600">
                {ranking.partidos_perdidos}
              </p>
              <p className="text-xs text-gray-500">Perdidos</p>
            </div>
          </div>
        </div>
      )}

      {/* Escudo del equipo favorito */}
      {jugador.escudo_equipo_url && (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <img
            src={jugador.escudo_equipo_url}
            alt={jugador.equipo_favorito || "Escudo"}
            className="h-10 w-10 rounded-full object-contain"
          />
          <div>
            <p className="text-sm text-gray-500">Equipo favorito</p>
            <p className="font-medium text-gray-800">
              {jugador.equipo_favorito}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
