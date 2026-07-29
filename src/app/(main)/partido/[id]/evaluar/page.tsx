import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EvaluacionSelectorClient } from "@/components/features/evaluacion/EvaluacionSelectorClient";

export const dynamic = "force-dynamic";

export default async function EvaluarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Verificar que el partido exista
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

  // Jugadores confirmados que jugaron
  const { data: asistenciasRaw } = await supabase
    .from("asistencia")
    .select("*, jugador:jugadores(*)")
    .eq("partido_id", id)
    .eq("estado", "asisto");

  const asistencias = (asistenciasRaw || []) as unknown as {
    jugador_id: string;
    jugador: { id: string; nombre_completo: string; foto_url: string | null };
  }[];

  const jugadoresAVotar = asistencias.map((a) => a.jugador);

  // Obtener todos los votos existentes de este partido, para pasarlos al cliente
  // y que el EvaluacionSelectorClient pueda filtrar dependiendo de qué evaluador se elija
  const { data: votosExistentesRaw } = await supabase
    .from("evaluaciones")
    .select("evaluador_id, evaluado_id, estrellas, comentario")
    .eq("partido_id", id);

  const votosExistentes = (votosExistentesRaw || []) as unknown as {
    evaluador_id: string;
    evaluado_id: string;
    estrellas: number;
    comentario: string | null;
  }[];

  return (
    <div className="space-y-5 animate-fade-in pb-24">
      <Link href={`/partido/${id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Volver al partido
      </Link>

      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-foreground">
          Evaluar Jugadores
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {partido.cancha?.nombre} —{" "}
          {new Date(partido.fecha_hora).toLocaleDateString("es-AR")}
        </p>
      </div>

      {jugadoresAVotar.length === 0 ? (
        <div className="card-premium flex flex-col items-center py-16">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#d4af37]/10">
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-lg font-semibold text-foreground">No hay jugadores para evaluar</p>
        <p className="mt-1 text-sm text-muted-foreground">
            Los jugadores confirmados aparecerán acá
          </p>
        </div>
      ) : (
        <EvaluacionSelectorClient
          partidoId={id}
          jugadoresAVotar={jugadoresAVotar}
          votosExistentes={votosExistentes}
        />
      )}
    </div>
  );
}
