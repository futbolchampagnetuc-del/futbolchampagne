"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function crearJugador(data: {
  nombre_completo: string;
  email: string;
  numero_dorsal?: number | null;
  equipo_favorito?: string | null;
  caracteristica_juego?: string | null;
  posiciones?: string[] | null;
  pie_habil?: string[] | null;
  talle_camiseta?: string | null;
  altura?: number | null;
  peso?: number | null;
  fecha_nacimiento?: string | null;
  rol?: "admin" | "jugador";
}) {
  const supabase = await createServerSupabaseClient();

  const newId = crypto.randomUUID();

  const { error } = await supabase
    .from("jugadores")
    .insert({
      id: newId,
      rol: data.rol || "jugador",
      nombre_completo: data.nombre_completo,
      email: data.email || `${data.nombre_completo.toLowerCase().replace(/\s+/g, '.')}@futbolchampagne.com`,
      numero_dorsal: data.numero_dorsal || null,
      equipo_favorito: data.equipo_favorito || null,
      caracteristica_juego: data.caracteristica_juego || null,
      posiciones: data.posiciones || [],
      pie_habil: data.pie_habil || [],
      talle_camiseta: data.talle_camiseta || null,
      altura: data.altura || null,
      peso: data.peso || null,
      fecha_nacimiento: data.fecha_nacimiento || null,
    } as never);

  if (error) throw new Error(error.message);

  // Crear habilidades por defecto
  await supabase.from("jugador_habilidades").insert({ jugador_id: newId } as never);

  revalidatePath("/jugadores");
  revalidatePath("/admin/jugadores");
}

export async function actualizarJugador(id: string, data: {
  nombre_completo?: string;
  numero_dorsal?: number | null;
  equipo_favorito?: string | null;
  caracteristica_juego?: string | null;
  posiciones?: string[] | null;
  pie_habil?: string[] | null;
  talle_camiseta?: string | null;
  altura?: number | null;
  peso?: number | null;
  fecha_nacimiento?: string | null;
  foto_url?: string | null;
}) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("jugadores")
    .update({ ...data, updated_at: new Date().toISOString() } as never)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/jugadores");
  revalidatePath("/admin/jugadores");
  revalidatePath("/perfil");
}

export async function actualizarHabilidades(id: string, habilidades: Record<string, number>) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("jugador_habilidades")
    .update({ ...habilidades, updated_at: new Date().toISOString() } as never)
    .eq("jugador_id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/jugadores");
  revalidatePath("/admin/jugadores");
  revalidatePath("/perfil");
}

export async function eliminarJugador(id: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("jugadores")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/jugadores");
  revalidatePath("/admin/jugadores");
}

export async function subirFotoJugador(jugadorId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const file = formData.get("foto") as File;
  if (!file) throw new Error("No se seleccionó archivo");
  if (!file.type.startsWith("image/")) throw new Error("Solo se permiten imágenes");
  if (file.size > 2 * 1024 * 1024) throw new Error("La imagen no puede superar 2MB");

  const fileExt = file.name.split(".").pop();
  const fileName = `${jugadorId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("fotos-jugadores")
    .upload(fileName, file, { upsert: true });
  if (uploadError) throw new Error(uploadError.message);

  const { data: { publicUrl } } = supabase.storage
    .from("fotos-jugadores")
    .getPublicUrl(fileName);

  const { error: updateError } = await supabase
    .from("jugadores")
    .update({ foto_url: publicUrl, updated_at: new Date().toISOString() } as never)
    .eq("id", jugadorId);

  if (updateError) throw new Error(updateError.message);

  revalidatePath("/jugadores");
  revalidatePath("/admin/jugadores");
  revalidatePath("/perfil");
  return publicUrl;
}
