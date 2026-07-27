import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import { AvatarWithName } from "@/components/shared/AvatarWithName";
import { PartidoGolesClient } from "@/components/features/partido/PartidoGolesClient";
import { PartidoAsistenciaClient } from "@/components/features/partido/PartidoAsistenciaClient";
import { PartidoAdminPanelClient } from "@/components/features/partido/PartidoAdminPanelClient";
import { ComentariosPartido } from "@/components/features/partido/ComentariosPartido";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PartidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // All players
  const { data: todosJugadores } = await supabase.from("jugadores").select("id, nombre_completo, foto_url").order("nombre_completo");

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
    estado: string;
    jugador: { id: string; nombre_completo: string; foto_url: string | null };
  }[];
  const confirmados = asistencias.filter((a) => a.estado === "asisto");

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

  // Comentarios
  const { data: comentariosRaw } = await supabase
    .from("comentarios_partido")
    .select("*, jugador:jugadores(nombre_completo, foto_url)")
    .eq("partido_id", id)
    .order("created_at", { ascending: true });
    
  const comentariosIniciales = (comentariosRaw || []) as any[];

  // Usuario actual
  const { data: { user } } = await supabase.auth.getUser();
  let jugadorIdActual = null;
  if (user && user.email) {
    const { data: userData } = await supabase
      .from("jugadores")
      .select("id")
      .eq("email", user.email)
      .single();
    if (userData) {
      jugadorIdActual = userData.id;
    }
  }

  return (
    <div className="space-y-5 animate-fade-in pb-24">
      {/* Back button */}
      <Link href="/partidos" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6b7280] hover:text-[#1a1a2e] transition-colors">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Volver a Partidos
      </Link>

      <h1 className="text-xl font-extrabold tracking-tight text-[#1a1a2e] mb-4">Detalle del Partido</h1>

      <PartidoAdminPanelClient
        partidoId={id}
        estado={partido.estado}
        equipoAGoles={partido.equipo_a_goles}
        equipoBGoles={partido.equipo_b_goles}
        equipoANombre={partido.equipo_a_nombre}
        equipoBNombre={partido.equipo_b_nombre}
      />

      {/* Card principal */}
      <div className="card-premium overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#d4af37] via-[#b8860b] to-[#d4af37]" />
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4af37]/10">
                  <svg className="h-4 w-4 text-[#c9952a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                </div>
                <p className="font-semibold text-[#1a1a2e]">{formatDateTime(partido.fecha_hora)}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0d9488]/10">
                  <svg className="h-4 w-4 text-[#0d9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-[#1a1a2e]">{partido.cancha?.nombre || "Sin Cancha"}</p>
                  <p className="text-sm text-[#6b7280]">{partido.cancha?.direccion || ""}</p>
                </div>
              </div>
            </div>
            <span className={`badge-champagne ${
              partido.estado === "finalizado" ? "bg-[#f0fdfa] text-[#0d9488] border-[#99f6e4]" :
              partido.estado === "jugando" ? "bg-[#f0fdfa] text-[#0d9488] border-[#99f6e4]" :
              "bg-[#f5f0e6] text-[#a67c2e] border-[#d4af37]/30"
            }`}>
              {partido.estado === "programado" ? "Programado" :
               partido.estado === "jugando" ? "Jugando" :
               partido.estado === "finalizado" ? "Finalizado" : "Cancelado"}
            </span>
          </div>

          {(partido.estado === "finalizado" ||
            (partido.equipo_a_goles !== null && partido.equipo_b_goles !== null)) && (
            <div className="mt-5 card-gold py-4 px-6 flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">{partido.equipo_a_nombre}</p>
                <p className="text-4xl font-extrabold text-[#1a1a2e] mt-1">
                  {partido.equipo_a_goles ?? "?"}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-8 w-px bg-[#d4af37]/30" />
                <p className="text-xs font-bold text-[#d4af37] px-3 py-1">VS</p>
                <div className="h-8 w-px bg-[#d4af37]/30" />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">{partido.equipo_b_nombre}</p>
                <p className="text-4xl font-extrabold text-[#1a1a2e] mt-1">
                  {partido.equipo_b_goles ?? "?"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {partido.estado !== "finalizado" && (
        <PartidoAsistenciaClient 
          partidoId={id} 
          jugadores={todosJugadores || []} 
          asistencias={asistencias} 
        />
      )}

      {partido.estado === "finalizado" && (
        <PartidoGolesClient
          partidoId={id}
          golesExistentes={goles}
          jugadores={confirmados.map((a) => ({ id: a.jugador_id, nombre_completo: a.jugador.nombre_completo }))}
        />
      )}

      {asignaciones.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="card-gold overflow-hidden">
            <div className="bg-gradient-to-r from-[#d4af37]/20 to-[#b8860b]/10 px-4 py-2.5">
              <h3 className="text-center font-bold text-[#a67c2e]">{partido.equipo_a_nombre}</h3>
            </div>
            <div className="p-3 space-y-1.5">
              {equipoA.map((a) => (
                <div key={a.id} className="rounded-lg bg-white/80 backdrop-blur-sm px-3 py-2 border border-[#d4af37]/10">
                  <AvatarWithName name={a.jugador?.nombre_completo} fotoUrl={a.jugador?.foto_url} size="sm" />
                </div>
              ))}
            </div>
          </div>
          <div className="card-premium overflow-hidden">
            <div className="bg-gradient-to-r from-[#0d9488]/10 to-[#0f766e]/10 px-4 py-2.5">
              <h3 className="text-center font-bold text-[#0d9488]">{partido.equipo_b_nombre}</h3>
            </div>
            <div className="p-3 space-y-1.5">
              {equipoB.map((a) => (
                <div key={a.id} className="rounded-lg bg-white/80 backdrop-blur-sm px-3 py-2 border border-[#0d9488]/10">
                  <AvatarWithName name={a.jugador?.nombre_completo} fotoUrl={a.jugador?.foto_url} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {partido.estado === "finalizado" && (
        <Link
          href={`/partido/${id}/evaluar`}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-semibold transition-all active:scale-[0.97] btn-primary"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
          </svg>
          Evaluar jugadores
        </Link>
      )}

      {/* Comentarios */}
      <div className="mt-8">
        <ComentariosPartido
          partidoId={id}
          comentariosIniciales={comentariosIniciales}
          jugadorIdActual={jugadorIdActual}
        />
      </div>
    </div>
  );
}
