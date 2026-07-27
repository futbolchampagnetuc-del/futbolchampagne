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
  evaluadorId: string;
}

export function EvaluacionForm({
  partidoId,
  jugadores,
  votosExistentes,
  evaluadorId,
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
            evaluadorId, // Admin evaluation ID
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
      <div className="flex flex-col items-center justify-center py-16 animate-scale-in">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#0d9488]/20 to-[#0f766e]/10">
          <svg className="h-8 w-8 text-[#0d9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#1a1a2e]">¡Evaluaciones guardadas!</h2>
        <p className="mt-2 text-center text-[#6b7280]">
          Has registrado los rendimientos exitosamente.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="card-premium p-4">
        <p className="text-sm text-[#6b7280]">
          Votá a cada jugador del 1 al 5. El promedio se usa para el ranking.
        </p>
      </div>

      {jugadores.map((jugador) => (
        <div
          key={jugador.id}
          className={cn(
            "card-premium p-4 transition-all duration-200 animate-slide-up",
            votos[jugador.id]?.estrellas > 0
              ? "border-[#d4af37]/30 bg-[#faf8f5]"
              : ""
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
              <p className="mb-1.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">
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
                className="input-premium resize-none"
              />
            </div>
          </div>
        </div>
      ))}

      <div className="card-premium flex items-center justify-between p-4">
        <p className="text-sm font-medium text-[#6b7280]">
          {totalVotados} de {jugadores.length} jugadores votados
        </p>
        {!todosVotados && (
          <span className="badge-champagne text-xs">
            Faltan {jugadores.length - totalVotados}
          </span>
        )}
        {todosVotados && totalVotados > 0 && (
          <span className="badge-emerald text-xs">
            ¡Completado!
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={saving || totalVotados === 0}
        className="btn-primary w-full text-base py-4"
      >
        {saving ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <>
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            </svg>
            Guardar evaluaciones ({totalVotados})
          </>
        )}
      </button>
    </form>
  );
}
