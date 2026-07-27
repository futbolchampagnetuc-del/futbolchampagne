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
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const jugadorActual = jugadores[currentIndex];
  const isFinished = currentIndex >= jugadores.length;

  const handleStarChange = (value: number) => {
    if (!jugadorActual) return;
    setVotos((prev) => ({
      ...prev,
      [jugadorActual.id]: { ...prev[jugadorActual.id], estrellas: value },
    }));
  };

  const handleComentarioChange = (value: string) => {
    if (!jugadorActual) return;
    setVotos((prev) => ({
      ...prev,
      [jugadorActual.id]: { ...prev[jugadorActual.id], comentario: value },
    }));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
  };
  
  const handleBack = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);

    try {
      for (const [jugadorId, voto] of Object.entries(votos)) {
        if (voto.estrellas > 0) {
          await votarJugador(
            partidoId,
            evaluadorId,
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

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-scale-in card-premium">
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

  // Resumen final antes de enviar
  if (isFinished) {
    const totalVotados = Object.values(votos).filter((v) => v.estrellas > 0).length;
    
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="card-premium p-6 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#b8860b]/10 text-3xl">
            📋
          </div>
          <h2 className="text-xl font-bold text-[#1a1a2e] mb-2">Resumen de Votación</h2>
          <p className="text-[#6b7280] mb-6">
            Vas a enviar {totalVotados} evaluaciones.
          </p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleSubmit()}
              disabled={saving || totalVotados === 0}
              className="btn-primary w-full py-4 text-base"
            >
              {saving ? (
                <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Guardar y Finalizar"
              )}
            </button>
            <button
              onClick={() => setCurrentIndex(0)}
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-[#6b7280] hover:text-[#1a1a2e]"
            >
              Volver a revisar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Wizard Paso a Paso
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between px-2">
        <span className="text-sm font-semibold text-[#6b7280]">
          Jugador {currentIndex + 1} de {jugadores.length}
        </span>
        <div className="flex gap-1">
          {jugadores.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === currentIndex ? "w-4 bg-[#d4af37]" : 
                i < currentIndex ? "w-1.5 bg-[#d4af37]/40" : "w-1.5 bg-gray-200"
              )}
            />
          ))}
        </div>
      </div>

      <div className="card-premium p-6 relative overflow-hidden min-h-[300px] flex flex-col">
        <div className="flex-1 flex flex-col items-center text-center">
          <AvatarWithName
            name={jugadorActual.nombre_completo}
            fotoUrl={jugadorActual.foto_url}
            size="lg"
            className="mb-4 flex-col gap-3"
          />
          
          <div className="w-full max-w-sm mt-4 space-y-5">
            <div className="flex justify-center">
              <StarRating
                value={votos[jugadorActual.id]?.estrellas || 0}
                onChange={handleStarChange}
                size="lg"
              />
            </div>
            
            <textarea
              placeholder="Comentario de su rendimiento (opcional)..."
              value={votos[jugadorActual.id]?.comentario || ""}
              onChange={(e) => handleComentarioChange(e.target.value)}
              rows={3}
              maxLength={200}
              className="input-premium w-full resize-none text-center"
            />
          </div>
        </div>
        
        <div className="mt-8 flex gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 disabled:opacity-30 transition-all"
          >
            Atrás
          </button>
          
          <button
            onClick={handleNext}
            className="flex-1 btn-primary py-3 flex justify-center items-center gap-2"
          >
            {currentIndex === jugadores.length - 1 ? "Finalizar" : "Siguiente"}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
