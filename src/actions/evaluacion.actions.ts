"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function votarJugador(
  partidoId: string,
  evaluadoId: string,
  estrellas: number,
  comentario?: string
) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  if (user.id === evaluadoId) {
    throw new Error("No puedes votarte a ti mismo");
  }
  if (estrellas < 0 || estrellas > 5) {
    throw new Error("Las estrellas deben ser entre 0 y 5");
  }

  // Verificar que el partido esté finalizado
  const { data: partidos } = await supabase
    .from("partidos")
    .select("estado")
    .eq("id", partidoId);

  const partido = partidos && partidos.length > 0
    ? partidos[0] as unknown as { estado: string }
    : null;

  if (!partido || partido.estado !== "finalizado") {
    throw new Error("El partido debe estar finalizado para votar");
  }

  // Upsert
  const { error } = await supabase
    .from("evaluaciones")
    .upsert({
      partido_id: partidoId,
      evaluador_id: user.id,
      evaluado_id: evaluadoId,
      estrellas,
      comentario: comentario || null,
    } as never, { onConflict: "partido_id, evaluador_id, evaluado_id" });

  if (error) throw new Error(error.message);

  revalidatePath(`/partido/${partidoId}/evaluar`);
}

export async function getEvaluaciones(partidoId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("evaluaciones")
    .select("*")
    .eq("partido_id", partidoId)
    .eq("evaluador_id", user.id);

  return (data || []) as unknown as {
    id: string;
    partido_id: string;
    evaluador_id: string;
    evaluado_id: string;
    estrellas: number;
    comentario: string | null;
    created_at: string;
  }[];
}
