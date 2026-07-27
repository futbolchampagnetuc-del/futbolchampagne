import Link from "next/link";
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
    .eq("estado", "programado")
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
      <div className="flex flex-col items-center justify-center pt-16 pb-12 animate-fade-in">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#b8860b]/10">
          <span className="text-5xl">⚽</span>
        </div>
        <h2 className="text-xl font-bold text-[#1a1a2e]">
          No hay próximo partido
        </h2>
        <p className="mt-2 text-center text-[#6b7280] max-w-xs">
          Cuando alguien cree un partido, lo verás acá
        </p>
        <div className="mt-8 h-px w-16 bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />
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
    <div className="space-y-5 animate-fade-in">
      {/* Header con saludo */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1a1a2e]">
            Próximo Partido
          </h1>
          {jugador && (
            <p className="mt-1 text-sm text-[#6b7280]">
              ¡Hola, <span className="font-semibold text-[#1a1a2e]">{jugador.nombre_completo.split(" ")[0]}</span>!
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href="/partidos"
            className="badge-champagne text-xs"
          >
            📋 Historial
          </Link>
          <Link
            href="/sorteo"
            className="badge-champagne text-xs"
          >
            🎲 Sorteo
          </Link>
        </div>
      </div>

      {/* Card del partido premium */}
      <div className="card-premium overflow-hidden">
        {/* Barra decorativa superior */}
        <div className="h-1 bg-gradient-to-r from-[#d4af37] via-[#b8860b] to-[#d4af37]" />

        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              {/* Fecha y hora */}
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d4af37]/10">
                  <svg className="h-5 w-5 text-[#c9952a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#1a1a2e]">
                    {formatDateTime(partido.fecha_hora)}
                  </p>
                </div>
              </div>

              {/* Cancha */}
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0d9488]/10">
                  <svg className="h-5 w-5 text-[#0d9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-[#1a1a2e]">
                    {partido.cancha?.nombre}
                  </p>
                  <p className="text-sm text-[#6b7280]">
                    {partido.cancha?.direccion}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="divider-champagne my-4" />

          {/* Componente interactivo de asistencia */}
          <ProximoPartidoClient
            partidoId={partido.id}
            jugadorId={user.id}
            miAsistencia={miAsistencia?.confirmado ?? null}
          />
        </div>
      </div>

      {/* Lista de asistentes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1a1a2e]">
            Asistencia
          </h2>
          <span className="badge-champagne">
            {confirmados.length} confirmados
          </span>
        </div>

        {confirmados.length === 0 && (
          <div className="card-premium p-6 text-center">
            <p className="text-sm text-[#6b7280]">
              Nadie confirmó todavía. ¡Sé el primero!
            </p>
          </div>
        )}

        <div className="space-y-2">
          {confirmados.map((a) => (
            <div key={a.id} className="card-premium flex items-center gap-3 px-4 py-3 animate-slide-up">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#0d9488] to-[#0f766e] text-sm font-bold text-white shadow-sm">
                {a.jugador?.nombre_completo?.charAt(0) || "?"}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#1a1a2e]">
                  {a.jugador?.nombre_completo}
                </p>
              </div>
              <span className="badge-emerald">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Va
              </span>
            </div>
          ))}
        </div>

        {noConfirmados.length > 0 && (
          <>
            <div className="divider-champagne my-2" />
            <h3 className="text-sm font-medium text-[#6b7280]">
              No van ({noConfirmados.length})
            </h3>
            <div className="space-y-2">
              {noConfirmados.map((a) => (
                <div key={a.id} className="card-premium flex items-center gap-3 px-4 py-3 opacity-75">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0ede6] text-sm font-bold text-[#9ca3af]">
                    {a.jugador?.nombre_completo?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#6b7280]">
                      {a.jugador?.nombre_completo}
                    </p>
                  </div>
                  <span className="badge-champagne bg-[#f0ede6] text-[#9ca3af] border-[#e5e0d8]">
                    ✕ No va
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
