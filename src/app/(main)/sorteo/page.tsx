import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SorteoClient } from "@/components/features/sorteo/SorteoClient";

export const dynamic = "force-dynamic";

export default async function SorteoPage() {
  const supabase = await createServerSupabaseClient();

  // Obtener el próximo partido pendiente
  const { data: partidosList } = await supabase
    .from("partidos")
    .select("*, cancha:canchas(*)")
    .eq("estado", "programado")
    .gte("fecha_hora", new Date().toISOString())
    .order("fecha_hora", { ascending: true })
    .limit(1);

  const partido = partidosList && partidosList.length > 0
    ? partidosList[0] as unknown as { id: string; fecha_hora: string; cancha: { nombre: string; direccion: string } }
    : null;

  // Obtener jugadores confirmados para ese partido
  let asistentes: any[] = [];
  let asignacionActual: { jugador_id: string; equipo: string }[] = [];

  if (partido) {
    const { data: asistencias } = await supabase
      .from("asistencia")
      .select("jugador:jugadores(id, nombre_completo, foto_url, fecha_nacimiento, altura, peso, jugador_habilidades(*))")
      .eq("partido_id", partido.id)
      .eq("estado", "asisto");

    asistentes = (asistencias || [])
      .map((a: any) => {
        const j = a.jugador;
        // Calcular edad
        let edad = null;
        if (j.fecha_nacimiento) {
          const birthDate = new Date(j.fecha_nacimiento);
          const ageDifMs = Date.now() - birthDate.getTime();
          const ageDate = new Date(ageDifMs);
          edad = Math.abs(ageDate.getUTCFullYear() - 1970);
        }

        // Calcular global rating
        let globalRating = 0;
        if (j.jugador_habilidades && j.jugador_habilidades.length > 0) {
          const h = j.jugador_habilidades[0];
          const attrs = [
            h.velocidad, h.resistencia, h.fuerza, h.quite, h.marcacion,
            h.pase, h.vision, h.pegada, h.definicion, h.cabezazo,
            h.juego_aereo, h.liderazgo, h.compromiso, h.estado_fisico,
            h.juego_colectivo, h.fair_play
          ];
          const validAttrs = attrs.filter(a => typeof a === 'number');
          if (validAttrs.length > 0) {
            globalRating = validAttrs.reduce((a, b) => a + b, 0) / validAttrs.length;
          }
        }

        return {
          id: j.id,
          nombre_completo: j.nombre_completo,
          foto_url: j.foto_url,
          edad,
          altura: j.altura,
          peso: j.peso,
          globalRating
        };
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
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1a1a2e]">Sorteo de Equipos</h1>
          <p className="mt-1 text-sm text-[#6b7280]">Armá los equipos para el próximo partido</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4af37]/10">
          <svg className="h-5 w-5 text-[#c9952a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.589-1.202L18.75 4.971ZM5.25 4.97c-1.052.158-2.09.352-3.11.558a.75.75 0 0 0-.583.813L2.25 18.25c0 .414.336.75.75.75h.415a5.982 5.982 0 0 0 2.085-.353c.483-.174.711-.703.589-1.202L5.25 4.971Z" />
          </svg>
        </div>
      </div>

      {!partido ? (
        <div className="card-premium flex flex-col items-center py-16">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#d4af37]/10">
            <span className="text-3xl">🎲</span>
          </div>
          <p className="text-lg font-semibold text-[#1a1a2e]">No hay partido programado</p>
          <p className="mt-1 text-sm text-[#6b7280]">
            Necesitás un partido activo para hacer el sorteo
          </p>
        </div>
      ) : asistentes.length < 4 ? (
        <div className="card-premium flex flex-col items-center py-16">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#d4af37]/10">
            <span className="text-3xl">👥</span>
          </div>
          <p className="text-lg font-semibold text-[#1a1a2e]">Faltan jugadores</p>
          <p className="mt-1 text-sm text-[#6b7280]">
            Se necesitan al menos 4 jugadores confirmados para sortear
          </p>
          <span className="mt-4 badge-champagne">
            Confirmados: {asistentes.length} jugadores
          </span>
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
