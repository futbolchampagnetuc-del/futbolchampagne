"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function crearPartido(data: {
  fecha_hora: string;
  cancha_id: string;
  lugar?: string;
  estado?: string;
  costo?: number;
  max_jugadores?: number;
  observaciones?: string;
}) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("partidos").insert(data as never);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/partidos");
  revalidatePath("/partidos");
}

export async function actualizarPartido(id: string, data: any) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("partidos").update(data as never).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/partidos");
  revalidatePath("/partidos");
  revalidatePath(`/partido/${id}`);
}

export async function eliminarPartido(id: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("partidos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/partidos");
  revalidatePath("/partidos");
}
