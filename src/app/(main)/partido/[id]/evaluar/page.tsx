import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EvaluacionForm } from "@/components/features/evaluacion/EvaluacionForm";

export const dynamic = "force-dynamic";

export default async function EvaluarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verificar que el partido exista y esté finalizado
  const { data: partidosList } = await supabase
    .from("partidos")
    .select("*, cancha:canchas(*)")
    .eq("id", id);

  const partido = partidosList && partidosList.length > 0
    ? partidosList[0] as unknown as {
        id: string;
        estado: string;
        fecha_hora: string;
        cancha: { nombre: string };
      }
    : null;

  if (!partido) notFound();
  if (partido.estado !== "finalizado") {
    redirect(`/partido/${id}`);
  }

  // Jugadores confirmados que jugaron (excluyendo al usuario)
  const { data: asistenciasRaw } = await supabase
    .from("asistencia")
    .select("*, jugador:jugadores(*)")
    .eq("partido_id", id)
    .eq("confirmado", true);

  const asistencias = (asistenciasRaw || []) as unknown as {
    jugador_id: string;
    jugador: { id: string; nombre_completo: string; foto_url: string | null };
  }[];

  const jugadoresAVotar = asistencias
    .filter((a) => a.jugador_id !== user.id)
    .map((a) => a.jugador);

  // Evaluaciones existentes del usuario
  const { data: votosExistentesRaw } = await supabase
    .from("evaluaciones")
    .select("*")
    .eq("partido_id", id)
    .eq("evaluador_id", user.id);

  const votosExistentes = (votosExistentesRaw || []) as unknown as {
    evaluado_id: string;
    estrellas: number;
    comentario: string | null;
  }[];

  const votosMap = new Map(
    votosExistentes.map((v) => [v.evaluado_id, { estrellas: v.estrellas, comentario: v.comentario }])
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          ⭐ Evaluar Compañeros
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {partido.cancha?.nombre} —{" "}
          {new Date(partido.fecha_hora).toLocaleDateString("es-AR")}
        </p>
      </div>

      {jugadoresAVotar.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-gray-400">
          <p className="text-lg">No hay jugadores para evaluar</p>
          <p className="mt-1 text-sm">
            Los jugadores confirmados aparecerán acá
          </p>
        </div>
      ) : (
        <EvaluacionForm
          partidoId={id}
          jugadores={jugadoresAVotar}
          votosExistentes={votosMap}
        />
      )}
    </div>
  );
}
