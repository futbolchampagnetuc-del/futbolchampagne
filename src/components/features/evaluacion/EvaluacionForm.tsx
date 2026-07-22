"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { votarJugador } from "@/actions/evaluacion.actions";
import { StarRating } from "@/components/shared/StarRating";
import { AvatarWithName } from "@/components/shared/AvatarWithName";
import { cn } from "@/lib/utils";

interface JugadorInfo {
  id: string;
  nombre_completo: string;
  foto_url: string | null;
}

interface VotoInfo {
  estrellas: number;
  comentario?: string | null;
}

interface EvaluacionFormProps {
  partidoId: string;
  jugadores: JugadorInfo[];
  votosExistentes: Map<string, VotoInfo>;
}

export function EvaluacionForm({
  partidoId,
  jugadores,
  votosExistentes,
}: EvaluacionFormProps) {
  const router = useRouter();
  const [votos, setVotos] = useState<Record<string, { estrellas: number; comentario: string }>>(() => {
    const initial: Record<string, { estrellas: number; comentario: string }> = {};
    jugadores.forEach((j) => {
      const existente = votosExistentes.get(j.id);
      initial[j.id] = {
        estrellas: existente?.estrellas || 0,
        comentario: existente?.comentario || "",
      };
    });
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleStarChange = (jugadorId: string, value: number) => {
    setVotos((prev) => ({
      ...prev,
      [jugadorId]: { ...prev[jugadorId], estrellas: value },
    }));
  };

  const handleComentarioChange = (jugadorId: string, value: string) => {
    setVotos((prev) => ({
      ...prev,
      [jugadorId]: { ...prev[jugadorId], comentario: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      for (const [jugadorId, voto] of Object.entries(votos)) {
        if (voto.estrellas > 0) {
          await votarJugador(
            partidoId,
            jugadorId,
            voto.estrellas,
            voto.comentario || undefined
          );
        }
      }

      setSuccess(true);
      router.refresh();
    } catch (error) {
      console.error("Error al guardar evaluaciones:", error);
    } finally {
      setSaving(false);
    }
  };

  const totalVotados = Object.values(votos).filter((v) => v.estrellas > 0).length;
  const todosVotados = totalVotados === jugadores.length;

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 text-5xl">✅</div>
        <h2 className="text-xl font-semibold text-gray-800">
          ¡Evaluaciones guardadas!
        </h2>
        <p className="mt-2 text-center text-gray-500">
          Gracias por votar a tus compañeros
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-500">
        Votá a cada jugador del 1 al 5. El promedio se usa para el ranking.
      </p>

      {jugadores.map((jugador) => (
        <div
          key={jugador.id}
          className={cn(
            "rounded-xl border p-4 transition-all",
            votos[jugador.id]?.estrellas > 0
              ? "border-green-200 bg-green-50"
              : "border-gray-200 bg-white"
          )}
        >
          <AvatarWithName
            name={jugador.nombre_completo}
            fotoUrl={jugador.foto_url}
            size="md"
            className="mb-3"
          />

          <div className="ml-12 space-y-3">
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">
                Rendimiento
              </p>
              <StarRating
                value={votos[jugador.id]?.estrellas || 0}
                onChange={(value) => handleStarChange(jugador.id, value)}
              />
            </div>

            <div>
              <textarea
                placeholder="Comentario (opcional)..."
                value={votos[jugador.id]?.comentario || ""}
                onChange={(e) =>
                  handleComentarioChange(jugador.id, e.target.value)
                }
                rows={2}
                maxLength={200}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
        <p className="text-sm text-gray-600">
          {totalVotados} de {jugadores.length} jugadores votados
        </p>
        {!todosVotados && (
          <p className="text-xs text-gray-400">
            Faltan {jugadores.length - totalVotados}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={saving || totalVotados === 0}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-60"
      >
        {saving
          ? "Guardando..."
          : `Guardar evaluaciones (${totalVotados})`}
      </button>
    </form>
  );
}
