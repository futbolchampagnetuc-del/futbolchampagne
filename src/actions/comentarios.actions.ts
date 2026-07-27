"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function agregarComentario(partidoId: string, autorNombre: string, texto: string) {
  if (!texto.trim()) return { success: false, error: "El comentario no puede estar vacío" };
  if (!autorNombre.trim()) return { success: false, error: "El nombre no puede estar vacío" };

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("comentarios_partido")
    .insert({
      partido_id: partidoId,
      autor_nombre: autorNombre.trim(),
      texto: texto.trim(),
      jugador_id: null, // Opcional por si en un futuro vuelve el login
    });

  if (error) {
    console.error("Error agregando comentario:", error);
    return { success: false, error: "No se pudo guardar el comentario" };
  }

  revalidatePath("/");
  revalidatePath(`/partido/${partidoId}`);
  return { success: true };
}
