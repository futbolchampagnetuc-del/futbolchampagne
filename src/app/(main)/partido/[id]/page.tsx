import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import { AvatarWithName } from "@/components/shared/AvatarWithName";
import { PartidoGolesClient } from "@/components/features/partido/PartidoGolesClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PartidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: partidosList } = await supabase
    .from("partidos")
    .select("*, cancha:canchas(*)")
    .eq("id", id);

  const partido = partidosList && partidosList.length > 0
    ? partidosList[0] as unknown as {
        id: string;
        fecha_hora: string;
        estado: string;
        cancha: { nombre: string; direccion: string };
        equipo_a_nombre: string;
        equipo_b_nombre: string;
        equipo_a_goles: number | null;
        equipo_b_goles: number | null;
      }
    : null;

  if (!partido) notFound();

  // Asistencias
  const { data: asistenciasRaw } = await supabase
    .from("asistencia")
    .select("*, jugador:jugadores(*)")
    .eq("partido_id", id);

  const asistencias = (asistenciasRaw || []) as unknown as {
    id: string;
    jugador_id: string;
    confirmado: boolean;
    jugador: { id: string; nombre_completo: string; foto_url: string | null };
  }[];
  const confirmados = asistencias.filter((a) => a.confirmado);

  // Equipos
  const { data: asignacionesRaw } = await supabase
    .from("asignacion_equipos")
    .select("*, jugador:jugadores(*)")
    .eq("partido_id", id);

  const asignaciones = (asignacionesRaw || []) as unknown as {
    id: string;
    equipo: string;
    jugador: { id: string; nombre_completo: string; foto_url: string | null };
  }[];
  const equipoA = asignaciones.filter((a) => a.equipo === "A");
  const equipoB = asignaciones.filter((a) => a.equipo === "B");

  // Goles
  const { data: golesRaw } = await supabase
    .from("goles_partido")
    .select("*, jugador:jugadores(*)")
    .eq("partido_id", id);

  const goles = (golesRaw || []) as unknown as {
    id: string;
    jugador_id: string;
    cantidad_goles: number;
    jugador: { nombre_completo: string };
  }[];

  // Verificar si el usuario ya votó
  const { data: misVotosRaw } = await supabase
    .from("evaluaciones")
    .select("evaluado_id")
    .eq("partido_id", id)
    .eq("evaluador_id", user.id);

  const misVotos = (misVotosRaw || []) as unknown as { evaluado_id: string }[];
  const votadosIds = new Set(misVotos.map((v) => v.evaluado_id));
  const yaVoto = misVotos.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Volver
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Detalle del Partido</h1>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {formatDateTime(partido.fecha_hora)}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {partido.cancha?.nombre} — {partido.cancha?.direccion}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
            partido.estado === "pendiente"
              ? "bg-yellow-100 text-yellow-700"
              : partido.estado === "jugando"
                ? "bg-green-100 text-green-700"
                : partido.estado === "finalizado"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-500"
          }`}>
            {partido.estado === "pendiente" ? "Pendiente" :
             partido.estado === "jugando" ? "Jugando" :
             partido.estado === "finalizado" ? "Finalizado" : "Cancelado"}
          </span>
        </div>

        {(partido.estado === "finalizado" ||
          (partido.equipo_a_goles !== null && partido.equipo_b_goles !== null)) && (
          <div className="mt-4 flex items-center justify-center gap-6 rounded-lg bg-gray-50 py-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">{partido.equipo_a_nombre}</p>
              <p className="text-3xl font-bold text-gray-900">
                {partido.equipo_a_goles ?? "?"}
              </p>
            </div>
            <p className="text-xl font-bold text-gray-400">vs</p>
            <div className="text-center">
              <p className="text-sm text-gray-500">{partido.equipo_b_nombre}</p>
              <p className="text-3xl font-bold text-gray-900">
                {partido.equipo_b_goles ?? "?"}
              </p>
            </div>
          </div>
        )}
      </div>

      {partido.estado === "finalizado" && (
        <PartidoGolesClient
          partidoId={id}
          jugadorId={user.id}
          golesExistentes={goles}
          jugadores={confirmados.map((a) => ({ id: a.jugador_id, nombre_completo: a.jugador.nombre_completo }))}
        />
      )}

      {asignaciones.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <h3 className="mb-3 text-center font-bold text-green-800">
              {partido.equipo_a_nombre}
            </h3>
            <div className="space-y-2">
              {equipoA.map((a) => (
                <div key={a.id} className="rounded-lg bg-white px-3 py-2 shadow-sm">
                  <AvatarWithName
                    name={a.jugador?.nombre_completo}
                    fotoUrl={a.jugador?.foto_url}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-3 text-center font-bold text-blue-800">
              {partido.equipo_b_nombre}
            </h3>
            <div className="space-y-2">
              {equipoB.map((a) => (
                <div key={a.id} className="rounded-lg bg-white px-3 py-2 shadow-sm">
                  <AvatarWithName
                    name={a.jugador?.nombre_completo}
                    fotoUrl={a.jugador?.foto_url}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {partido.estado === "finalizado" && (
        <div className="pt-2">
          <Link
            href={`/partido/${id}/evaluar`}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold shadow-sm transition-all active:scale-[0.98] ${
              yaVoto
                ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {yaVoto ? "⭐ Editar evaluación" : "⭐ Evaluar compañeros"}
          </Link>
        </div>
      )}
    </div>
  );
}
