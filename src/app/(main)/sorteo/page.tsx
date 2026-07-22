import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SorteoClient } from "@/components/features/sorteo/SorteoClient";

export const dynamic = "force-dynamic";

export default async function SorteoPage() {
  const supabase = await createServerSupabaseClient();

  // Obtener el próximo partido pendiente
  const { data: partidosList } = await supabase
    .from("partidos")
    .select("*, cancha:canchas(*)")
    .eq("estado", "pendiente")
    .gte("fecha_hora", new Date().toISOString())
    .order("fecha_hora", { ascending: true })
    .limit(1);

  const partido = partidosList && partidosList.length > 0
    ? partidosList[0] as unknown as { id: string; fecha_hora: string; cancha: { nombre: string; direccion: string } }
    : null;

  // Obtener jugadores confirmados para ese partido
  let asistentes: { id: string; nombre_completo: string; foto_url: string | null; }[] = [];
  let asignacionActual: { jugador_id: string; equipo: string }[] = [];

  if (partido) {
    const { data: asistencias } = await supabase
      .from("asistencia")
      .select("jugador:jugadores(id, nombre_completo, foto_url)")
      .eq("partido_id", partido.id)
      .eq("confirmado", true);

    asistentes = (asistencias || [])
      .map((a: unknown) => {
        const item = a as { jugador: { id: string; nombre_completo: string; foto_url: string | null } };
        return item.jugador;
      })
      .filter(Boolean);

    // Verificar si ya hay un sorteo hecho
    const { data: asignaciones } = await supabase
      .from("asignacion_equipos")
      .select("jugador_id, equipo")
      .eq("partido_id", partido.id);

    if (asignaciones && asignaciones.length > 0) {
      asignacionActual = asignaciones as unknown as { jugador_id: string; equipo: string }[];
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Sorteo de Equipos</h1>

      {!partido ? (
        <div className="flex flex-col items-center py-12 text-gray-400">
          <div className="mb-3 text-5xl">🎲</div>
          <p className="text-lg font-medium">No hay partido programado</p>
          <p className="mt-1 text-sm">
            Necesitás un partido activo para hacer el sorteo
          </p>
        </div>
      ) : asistentes.length < 4 ? (
        <div className="flex flex-col items-center py-12 text-gray-400">
          <div className="mb-3 text-5xl">👥</div>
          <p className="text-lg font-medium">Faltan jugadores</p>
          <p className="mt-1 text-sm">
            Se necesitan al menos 4 jugadores confirmados para sortear
          </p>
          <p className="mt-4 text-xs text-gray-400">
            Confirmados: {asistentes.length} jugadores
          </p>
        </div>
      ) : (
        <SorteoClient
          partidoId={partido.id}
          asistentes={asistentes}
          asignacionActual={asignacionActual}
        />
      )}
    </div>
  );
}
