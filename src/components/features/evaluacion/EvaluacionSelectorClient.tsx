"use client";

import { useState } from "react";
import { AvatarWithName } from "@/components/shared/AvatarWithName";
import { EvaluacionForm } from "./EvaluacionForm";
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

interface EvaluacionSelectorClientProps {
  partidoId: string;
  jugadoresAVotar: JugadorInfo[];
  votosExistentes: { evaluador_id: string; evaluado_id: string; estrellas: number; comentario: string | null }[];
}

export function EvaluacionSelectorClient({
  partidoId,
  jugadoresAVotar,
  votosExistentes,
}: EvaluacionSelectorClientProps) {
  const [evaluadorId, setEvaluadorId] = useState<string | null>(null);

  // Seleccionar quién va a votar
  if (!evaluadorId) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="card-premium p-6 text-center border-[#d4af37]/30 shadow-lg">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#b8860b]/10 text-3xl">
            🤔
          </div>
          <h2 className="text-xl font-bold text-[#1a1a2e] mb-2">¿Quién está votando?</h2>
          <p className="text-sm text-[#6b7280] mb-6">
            Seleccioná tu nombre en la lista para empezar a evaluar a los demás jugadores.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {jugadoresAVotar.map(j => (
              <button
                key={j.id}
                onClick={() => setEvaluadorId(j.id)}
                className="flex items-center p-3 rounded-xl border border-[#e5e0d8] hover:border-[#d4af37] hover:bg-[#faf8f5] transition-all"
              >
                <AvatarWithName name={j.nombre_completo} fotoUrl={j.foto_url} size="sm" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Filtrar de la lista de votados al propio votante
  const jugadoresFiltrados = jugadoresAVotar.filter(j => j.id !== evaluadorId);
  const evaluador = jugadoresAVotar.find(j => j.id === evaluadorId);
  
  // Construir mapa de votos previos del votante seleccionado
  const votosMap = new Map<string, VotoInfo>();
  votosExistentes
    .filter(v => v.evaluador_id === evaluadorId)
    .forEach(v => votosMap.set(v.evaluado_id, { estrellas: v.estrellas, comentario: v.comentario }));

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between card-premium p-3 bg-gradient-to-r from-[#1a1a2e] to-[#2a2a4a] text-white">
        <div className="flex items-center gap-3">
          <AvatarWithName name={evaluador?.nombre_completo || ""} fotoUrl={evaluador?.foto_url || null} size="sm" />
          <div className="flex flex-col">
            <span className="text-xs text-white/70">Estás votando como:</span>
            <span className="font-bold">{evaluador?.nombre_completo}</span>
          </div>
        </div>
        <button 
          onClick={() => setEvaluadorId(null)}
          className="text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
        >
          Cambiar
        </button>
      </div>

      <EvaluacionForm 
        partidoId={partidoId}
        evaluadorId={evaluadorId}
        jugadores={jugadoresFiltrados}
        votosExistentes={votosMap}
      />
    </div>
  );
}
