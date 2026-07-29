import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const jugadorId = request.nextUrl.searchParams.get("jugadorId");
  if (!jugadorId) {
    return NextResponse.json({ matches: [] });
  }

  const supabase = await createServerSupabaseClient();

  const { data: asignaciones } = await supabase
    .from("asignacion_equipos")
    .select("equipo, partido:partidos!inner(*)")
    .eq("jugador_id", jugadorId)
    .eq("partido.estado", "finalizado")
    .order("partido.fecha_hora", { ascending: false });

  if (!asignaciones) {
    return NextResponse.json({ matches: [] });
  }

  const matches = (asignaciones as any[]).map((a: any) => {
    const p = a.partido;
    const miEquipo = a.equipo as "A" | "B";
    const misGoles = miEquipo === "A" ? p.equipo_a_goles : p.equipo_b_goles;
    const susGoles = miEquipo === "A" ? p.equipo_b_goles : p.equipo_a_goles;

    let resultado: "ganado" | "perdido" | "empatado" = "empatado";
    if (misGoles !== null && susGoles !== null) {
      if (misGoles > susGoles) resultado = "ganado";
      else if (misGoles < susGoles) resultado = "perdido";
    }

    return {
      id: p.id,
      fecha_hora: p.fecha_hora,
      equipo_a_nombre: p.equipo_a_nombre,
      equipo_b_nombre: p.equipo_b_nombre,
      equipo_a_goles: p.equipo_a_goles,
      equipo_b_goles: p.equipo_b_goles,
      miEquipo,
      resultado,
    };
  });

  return NextResponse.json({ matches });
}
