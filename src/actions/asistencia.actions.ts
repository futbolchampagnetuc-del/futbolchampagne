"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function confirmarAsistencia(partidoId: string, jugadorId: string, estado: "asisto" | "no asisto" | "tal_vez" | "pendiente") {
  const supabase = await createServerSupabaseClient();

  // Buscar si ya existe registro de asistencia
  const { data: existenteArr, error: selError } = await supabase
    .from("asistencia")
    .select("id")
    .eq("partido_id", partidoId)
    .eq("jugador_id", jugadorId);

  if (selError) throw new Error(selError.message);

  const existente = existenteArr && existenteArr.length > 0 ? existenteArr[0] as unknown as { id: string } : null;

  if (existente) {
    // Actualizar registro
    const { error } = await supabase
      .from("asistencia")
      .update({ estado: estado, fecha_confirmacion: new Date().toISOString() } as never)
      .eq("id", existente.id);
    if (error) throw new Error(error.message);
  } else {
    // Nuevo registro
    const { error } = await supabase
      .from("asistencia")
      .insert({ partido_id: partidoId, jugador_id: jugadorId, estado: estado } as never);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath(`/partido/${partidoId}`);
}

export async function cancelarAsistencia(partidoId: string, jugadorId: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("asistencia")
    .delete()
    .eq("partido_id", partidoId)
    .eq("jugador_id", jugadorId);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/partido/${partidoId}`);
}
