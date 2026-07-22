"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function actualizarPerfil(data: Record<string, unknown>) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase
    .from("jugadores")
    .update({ ...data, updated_at: new Date().toISOString() } as never)
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/perfil");
}

export async function subirFoto(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const file = formData.get("foto") as File;
  if (!file) throw new Error("No se seleccionó archivo");
  if (!file.type.startsWith("image/")) throw new Error("Solo se permiten imágenes");
  if (file.size > 2 * 1024 * 1024) throw new Error("La imagen no puede superar 2MB");

  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

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
    .eq("id", user.id);

  if (updateError) throw new Error(updateError.message);

  revalidatePath("/perfil");
  return publicUrl;
}
