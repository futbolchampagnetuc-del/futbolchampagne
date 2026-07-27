"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function crearCancha(data: {
  nombre: string;
  direccion: string;
  coordenadas?: string;
  telefono_contacto?: string;
}) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("canchas").insert(data as never);
  if (error) {
    return { success: false, error: error.message };
  }
  revalidatePath("/admin/canchas");
  return { success: true };
}

export async function actualizarCancha(id: string, data: any) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("canchas").update(data as never).eq("id", id);
  if (error) {
    return { success: false, error: error.message };
  }
  revalidatePath("/admin/canchas");
  return { success: true };
}

export async function eliminarCancha(id: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("canchas").delete().eq("id", id);
  if (error) {
    // 23503 is the Postgres error code for foreign_key_violation
    if (error.code === '23503') {
      return { success: false, error: "No se puede eliminar la cancha porque tiene partidos asociados. Primero elimine los partidos." };
    }
    return { success: false, error: error.message };
  }
  revalidatePath("/admin/canchas");
  return { success: true };
}
