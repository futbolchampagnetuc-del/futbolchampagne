"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function confirmarAsistencia(partidoId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  // Buscar si ya existe registro de asistencia (usando el cliente SSR)
  const { data: existenteArr, error: selError } = await supabase
    .from("asistencia")
    .select("id, confirmado")
    .eq("partido_id", partidoId)
    .eq("jugador_id", user.id);

  if (selError) throw new Error(selError.message);

  const existente = existenteArr && existenteArr.length > 0 ? existenteArr[0] as unknown as { id: string; confirmado: boolean } : null;

  if (existente) {
    // Toggle
    const nuevoValor = !existente.confirmado;
    const { error } = await supabase
      .from("asistencia")
      .update({ confirmado: nuevoValor } as never)
      .eq("id", existente.id);
    if (error) throw new Error(error.message);
  } else {
    // Nuevo registro
    const { error } = await supabase
      .from("asistencia")
      .insert({ partido_id: partidoId, jugador_id: user.id, confirmado: true } as never);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath(`/partido/${partidoId}`);
}

export async function cancelarAsistencia(partidoId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase
    .from("asistencia")
    .delete()
    .eq("partido_id", partidoId)
    .eq("jugador_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/partido/${partidoId}`);
}
