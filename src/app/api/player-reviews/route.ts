import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const jugadorId = request.nextUrl.searchParams.get("jugadorId");
  if (!jugadorId) {
    return NextResponse.json({ reviews: [] });
  }

  const supabase = await createServerSupabaseClient();

  const { data: evaluaciones } = await supabase
    .from("evaluaciones")
    .select("estrellas, comentario, premio, partido_id, evaluador:jugadores!evaluaciones_evaluador_id_fkey(nombre_completo)")
    .eq("evaluado_id", jugadorId)
    .not("evaluador_id", "is", null)
    .order("created_at", { ascending: false });

  if (!evaluaciones) {
    return NextResponse.json({ reviews: [] });
  }

  const { data: partidos } = await supabase
    .from("partidos")
    .select("id, fecha_hora")
    .in("id", (evaluaciones as any[]).map((e: any) => e.partido_id));

  const partidoMap = new Map((partidos || []).map((p: any) => [p.id, p.fecha_hora]));

  const reviews = (evaluaciones as any[]).map((e: any) => ({
    partido_id: e.partido_id,
    partido_fecha: partidoMap.get(e.partido_id) || "",
    evaluador_nombre: e.evaluador?.nombre_completo || "Anónimo",
    estrellas: e.estrellas,
    comentario: e.comentario,
    premio: e.premio,
  }));

  return NextResponse.json({ reviews });
}
