import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import { ProximoPartidoClient } from "@/components/features/partido/ProximoPartidoClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Obtener el jugador actual
  const { data: jugadorRaw } = await supabase
    .from("jugadores")
    .select("*")
    .eq("id", user.id);

  const jugador = jugadorRaw && jugadorRaw.length > 0
    ? jugadorRaw[0] as unknown as { nombre_completo: string }
    : null;

  // Obtener próximo partido
  const { data: partidosList } = await supabase
    .from("partidos")
    .select("*, cancha:canchas(*)")
    .eq("estado", "pendiente")
    .gte("fecha_hora", new Date().toISOString())
    .order("fecha_hora", { ascending: true })
    .limit(1);

  const partido = partidosList && partidosList.length > 0
    ? partidosList[0] as unknown as {
        id: string;
        fecha_hora: string;
        cancha: { nombre: string; direccion: string };
      }
    : null;

  // Si no hay próximo partido
  if (!partido) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 text-5xl">⚽</div>
        <h2 className="text-xl font-semibold text-gray-800">
          No hay próximo partido
        </h2>
        <p className="mt-2 text-center text-gray-500">
          Cuando alguien cree un partido, lo verás acá
        </p>
      </div>
    );
  }

  // Obtener asistencias del partido
  const { data: asistenciasRaw } = await supabase
    .from("asistencia")
    .select("*, jugador:jugadores(*)")
    .eq("partido_id", partido.id);

  const asistencias = (asistenciasRaw || []) as unknown as {
    id: string;
    partido_id: string;
    jugador_id: string;
    confirmado: boolean;
    jugador: { nombre_completo: string };
  }[];

  const confirmados = asistencias.filter((a) => a.confirmado);
  const noConfirmados = asistencias.filter((a) => !a.confirmado);
  const miAsistencia = asistencias.find((a) => a.jugador_id === user.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Próximo Partido
        </h1>
        {jugador && (
          <p className="mt-1 text-sm text-gray-500">
            ¡Hola, {jugador.nombre_completo.split(" ")[0]}!
          </p>
        )}
      </div>

      {/* Card del partido */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <div className="text-lg font-semibold text-gray-900">
            {formatDateTime(partido.fecha_hora)}
          </div>
          <div className="mt-2 flex items-start gap-2 text-gray-600">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <div>
              <p className="font-medium text-gray-800">
                {partido.cancha?.nombre}
              </p>
              <p className="text-sm text-gray-500">
                {partido.cancha?.direccion}
              </p>
            </div>
          </div>
        </div>

        {/* Componente interactivo de asistencia */}
        <ProximoPartidoClient
          partidoId={partido.id}
          jugadorId={user.id}
          miAsistencia={miAsistencia?.confirmado ?? null}
        />
      </div>

      {/* Lista de asistentes */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Asistencia ({confirmados.length})
        </h2>

        {confirmados.length === 0 && (
          <p className="text-sm text-gray-400">
            Nadie confirmó todavía. ¡Sé el primero!
          </p>
        )}

        <div className="space-y-2">
          {confirmados.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-lg bg-green-50 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-200 text-sm font-semibold text-green-800">
                {a.jugador?.nombre_completo?.charAt(0) || "?"}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  {a.jugador?.nombre_completo}
                </p>
              </div>
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                ✅ Va
              </span>
            </div>
          ))}
        </div>

        {noConfirmados.length > 0 && (
          <>
            <h3 className="pt-2 text-sm font-medium text-gray-500">
              No van ({noConfirmados.length})
            </h3>
            <div className="space-y-2">
              {noConfirmados.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-500">
                    {a.jugador?.nombre_completo?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-600">
                      {a.jugador?.nombre_completo}
                    </p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                    ❌ No va
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
