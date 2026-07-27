"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function realizarSorteo(
  partidoId: string,
  tipo: "random" | "balanceado"
) {
  const supabase = await createServerSupabaseClient();

  // Obtener jugadores confirmados
  const { data: asistencias } = await supabase
    .from("asistencia")
    .select("jugador_id")
    .eq("partido_id", partidoId)
    .eq("estado", "asisto");

  if (!asistencias || asistencias.length < 4) {
    throw new Error("Se necesitan al menos 4 jugadores confirmados (asisto)");
  }

  const asisArr = asistencias as unknown as { jugador_id: string }[];
  const idsAsistentes = asisArr.map((a) => a.jugador_id);

  // Obtener datos completos de los jugadores
  const { data: jugadores } = await supabase
    .from("jugadores")
    .select("id, nombre_completo, foto_url")
    .in("id", idsAsistentes);

  if (!jugadores || jugadores.length < 4) {
    throw new Error("Error al obtener datos de jugadores");
  }

  const jugadoresList = jugadores as unknown as {
    id: string;
    nombre_completo: string;
    foto_url: string | null;
  }[];

  let equipoA: typeof jugadoresList;
  let equipoB: typeof jugadoresList;

  if (tipo === "random") {
    const shuffled = [...jugadoresList].sort(() => Math.random() - 0.5);
    const mid = Math.ceil(shuffled.length / 2);
    equipoA = shuffled.slice(0, mid);
    equipoB = shuffled.slice(mid);
  } else {
    // Balanceado: obtener ratings de evaluaciones
    const jugadoresConRating = await Promise.all(
      jugadoresList.map(async (j) => {
        const { data: evaluaciones } = await supabase
          .from("evaluaciones")
          .select("estrellas")
          .eq("evaluado_id", j.id);

        const evals = (evaluaciones || []) as unknown as { estrellas: number }[];
        const avg = evals.length > 0
          ? evals.reduce((sum, e) => sum + e.estrellas, 0) / evals.length
          : 2.5;

        return { jugador: j, rating: avg };
      })
    );

    jugadoresConRating.sort((a, b) => b.rating - a.rating);

    equipoA = [];
    equipoB = [];
    let sumaA = 0;
    let sumaB = 0;

    for (const item of jugadoresConRating) {
      if (sumaA <= sumaB) {
        equipoA.push(item.jugador);
        sumaA += item.rating;
      } else {
        equipoB.push(item.jugador);
        sumaB += item.rating;
      }
    }
  }

  // Limpiar asignaciones previas
  await supabase
    .from("asignacion_equipos")
    .delete()
    .eq("partido_id", partidoId);

  // Insertar nuevas asignaciones
  const asignaciones = [
    ...equipoA.map((j) => ({
      partido_id: partidoId,
      jugador_id: j.id,
      equipo: "A" as const,
      tipo_sorteo: tipo,
    })),
    ...equipoB.map((j) => ({
      partido_id: partidoId,
      jugador_id: j.id,
      equipo: "B" as const,
      tipo_sorteo: tipo,
    })),
  ];

  const { error } = await supabase
    .from("asignacion_equipos")
    .insert(asignaciones as never);

  if (error) throw new Error(error.message);

  revalidatePath("/sorteo");
  revalidatePath(`/partido/${partidoId}`);

  return { equipoA, equipoB };
}

export async function guardarSorteoManual(
  partidoId: string,
  equipoAIds: string[],
  equipoBIds: string[]
) {
  const supabase = await createServerSupabaseClient();

  // Limpiar asignaciones previas
  await supabase
    .from("asignacion_equipos")
    .delete()
    .eq("partido_id", partidoId);

  // Insertar nuevas asignaciones
  const asignaciones = [
    ...equipoAIds.map((id) => ({
      partido_id: partidoId,
      jugador_id: id,
      equipo: "A" as const,
      tipo_sorteo: "manual" as const,
    })),
    ...equipoBIds.map((id) => ({
      partido_id: partidoId,
      jugador_id: id,
      equipo: "B" as const,
      tipo_sorteo: "manual" as const,
    })),
  ];

  if (asignaciones.length > 0) {
    const { error } = await supabase
      .from("asignacion_equipos")
      .insert(asignaciones as never);

    if (error) throw new Error(error.message);
  }

  revalidatePath("/sorteo");
  revalidatePath(`/partido/${partidoId}`);
  
  return { success: true };
}
