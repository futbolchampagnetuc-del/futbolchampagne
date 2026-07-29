import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SorteoClient } from "@/components/features/sorteo/SorteoClient";
import { Shuffle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SorteoPage() {
  const supabase = await createServerSupabaseClient();

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
        let edad = null;
        if (j.fecha_nacimiento) {
          const birthDate = new Date(j.fecha_nacimiento);
          const ageDifMs = Date.now() - birthDate.getTime();
          const ageDate = new Date(ageDifMs);
          edad = Math.abs(ageDate.getUTCFullYear() - 1970);
        }
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
          <h1 className="text-2xl font-black tracking-tight text-foreground">Sorteo</h1>
          <p className="mt-1 text-sm text-muted-foreground">Armá los equipos para el próximo partido</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center">
          <Shuffle className="w-5 h-5 text-[#d4af37]" />
        </div>
      </div>

      {!partido ? (
        <div className="card-dark rounded-2xl flex flex-col items-center py-16">
          <div className="mb-5 w-16 h-16 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
            <Shuffle className="w-8 h-8 text-[#d4af37]/60" />
          </div>
          <p className="text-lg font-semibold text-foreground">No hay partido programado</p>
          <p className="mt-1 text-sm text-muted-foreground">Necesitás un partido activo para hacer el sorteo</p>
        </div>
      ) : asistentes.length < 4 ? (
        <div className="card-dark rounded-2xl flex flex-col items-center py-16">
          <div className="mb-5 w-16 h-16 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
            <span className="text-3xl">👥</span>
          </div>
          <p className="text-lg font-semibold text-foreground">Faltan jugadores</p>
          <p className="mt-1 text-sm text-muted-foreground">Se necesitan al menos 4 jugadores confirmados para sortear</p>
          <span className="mt-4 text-xs font-semibold text-[#d4af37] bg-[#d4af37]/10 px-3 py-1 rounded-full">
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
