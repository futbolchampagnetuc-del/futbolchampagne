import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import { AvatarWithName } from "@/components/shared/AvatarWithName";
import { PartidoGolesClient } from "@/components/features/partido/PartidoGolesClient";
import { PartidoAsistenciaClient } from "@/components/features/partido/PartidoAsistenciaClient";
import { PartidoAdminPanelClient } from "@/components/features/partido/PartidoAdminPanelClient";
import { ComentariosPartido } from "@/components/features/partido/ComentariosPartido";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Star, Swords } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PartidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: todosJugadores } = await supabase.from("jugadores").select("id, nombre_completo, foto_url").order("nombre_completo");

  const { data: partidosList } = await supabase
    .from("partidos")
    .select("*, cancha:canchas(*)")
    .eq("id", id);

  const partido = partidosList && partidosList.length > 0
    ? partidosList[0] as unknown as {
        id: string; fecha_hora: string; estado: string;
        cancha: { nombre: string; direccion: string };
        equipo_a_nombre: string; equipo_b_nombre: string;
        equipo_a_goles: number | null; equipo_b_goles: number | null;
      }
    : null;

  if (!partido) notFound();

  const { data: asistenciasRaw } = await supabase
    .from("asistencia")
    .select("*, jugador:jugadores(*)")
    .eq("partido_id", id);
  const asistencias = (asistenciasRaw || []) as any[];

  const confirmados = asistencias.filter((a) => a.estado === "asisto");
  const noAsisten = asistencias.filter((a) => a.estado === "no asisto");

  const { data: asignacionesRaw } = await supabase
    .from("asignacion_equipos")
    .select("*, jugador:jugadores(nombre_completo, foto_url)")
    .eq("partido_id", id);
  const asignaciones = (asignacionesRaw || []) as unknown as { id: string; equipo: string; jugador: { nombre_completo: string; foto_url: string | null } }[];

  const equipoA = asignaciones.filter((a) => a.equipo === "A");
  const equipoB = asignaciones.filter((a) => a.equipo === "B");

  const { data: golesRaw } = await supabase
    .from("goles_partido")
    .select("*, jugador:jugadores(nombre_completo)")
    .eq("partido_id", id);
  const goles = (golesRaw || []) as unknown as { id: string; jugador_id: string; cantidad_goles: number; jugador: { nombre_completo: string } }[];

  const { data: { user } } = await supabase.auth.getUser();
  let jugadorIdActual = null;
  if (user && user.email) {
    const { data: userData } = await supabase.from("jugadores").select("id").eq("email", user.email).single();
    if (userData) jugadorIdActual = userData.id;
  }

  const { data: comentariosRaw } = await supabase
    .from("comentarios_partido")
    .select("*")
    .eq("partido_id", id)
    .order("created_at", { ascending: true });
  const comentariosIniciales = (comentariosRaw || []) as any[];

  return (
    <div className="space-y-5 animate-fade-in pb-24">
      <Link href="/partidos" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Volver a Partidos
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black tracking-tight text-foreground">Detalle del Partido</h1>
        <span className={`text-[10px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider ${
          partido.estado === "finalizado" ? "bg-emerald-500/10 text-emerald-400" :
          partido.estado === "jugando" ? "bg-[#d4af37]/10 text-[#d4af37]" :
          "bg-muted text-muted-foreground"
        }`}>
          {partido.estado === "programado" ? "Programado" :
           partido.estado === "jugando" ? "Jugando" :
           partido.estado === "finalizado" ? "Finalizado" : "Cancelado"}
        </span>
      </div>

      <PartidoAdminPanelClient
        partidoId={id}
        estado={partido.estado}
        equipoAGoles={partido.equipo_a_goles}
        equipoBGoles={partido.equipo_b_goles}
        equipoANombre={partido.equipo_a_nombre}
        equipoBNombre={partido.equipo_b_nombre}
      />

      <div className="card-dark rounded-2xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#d4af37]" />
        <div className="p-5">
          <div className="flex items-start gap-4">
            <Calendar className="w-5 h-5 text-[#d4af37] mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-foreground">{formatDateTime(partido.fecha_hora)}</p>
              <p className="text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 inline mr-1" />
                {partido.cancha?.nombre || "Sin Cancha"}{partido.cancha?.direccion ? ` · ${partido.cancha.direccion}` : ""}
              </p>
            </div>
          </div>

          {(partido.estado === "finalizado" || (partido.equipo_a_goles !== null && partido.equipo_b_goles !== null)) && (
            <div className="mt-5 rounded-xl bg-muted/50 border border-border py-3 sm:py-4 px-3 sm:px-6 flex items-center justify-center gap-3 sm:gap-6">
              <div className="text-center min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">{partido.equipo_a_nombre}</p>
                <p className="text-3xl sm:text-4xl font-black text-foreground mt-1">{partido.equipo_a_goles ?? "?"}</p>
              </div>
              <div className="flex flex-col items-center shrink-0">
                <div className="h-6 sm:h-8 w-px bg-[#d4af37]/30" />
                <p className="text-[10px] sm:text-xs font-bold text-[#d4af37] px-2 sm:px-3 py-0.5 sm:py-1">VS</p>
                <div className="h-6 sm:h-8 w-px bg-[#d4af37]/30" />
              </div>
              <div className="text-center min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">{partido.equipo_b_nombre}</p>
                <p className="text-3xl sm:text-4xl font-black text-foreground mt-1">{partido.equipo_b_goles ?? "?"}</p>
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

      {(partido.estado === "finalizado" || partido.estado === "jugando") && (
        <PartidoGolesClient
          partidoId={id}
          golesExistentes={goles}
          jugadores={confirmados.map((a) => ({ id: a.jugador_id, nombre_completo: a.jugador.nombre_completo }))}
        />
      )}

      {asignaciones.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="card-dark rounded-2xl overflow-hidden">
            <div className="bg-blue-500/10 px-4 py-2.5">
              <h3 className="text-center font-bold text-blue-400">{partido.equipo_a_nombre}</h3>
            </div>
            <div className="p-3 space-y-1.5">
              {equipoA.map((a) => (
                <div key={a.id} className="rounded-xl bg-muted/30 px-3 py-2 border border-border/50">
                  <AvatarWithName name={a.jugador?.nombre_completo} fotoUrl={a.jugador?.foto_url} size="sm" />
                </div>
              ))}
            </div>
          </div>
          <div className="card-dark rounded-2xl overflow-hidden">
            <div className="bg-red-500/10 px-4 py-2.5">
              <h3 className="text-center font-bold text-red-400">{partido.equipo_b_nombre}</h3>
            </div>
            <div className="p-3 space-y-1.5">
              {equipoB.map((a) => (
                <div key={a.id} className="rounded-xl bg-muted/30 px-3 py-2 border border-border/50">
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
          className="btn-gold flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold"
        >
          <Star className="w-5 h-5" />
          Evaluar jugadores
        </Link>
      )}

      <ComentariosPartido
        partidoId={id}
        comentariosIniciales={comentariosIniciales}
        estadoPartido={partido.estado}
      />
    </div>
  );
}
