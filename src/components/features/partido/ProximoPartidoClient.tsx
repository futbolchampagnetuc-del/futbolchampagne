"use client";

import { useState } from "react";
import { confirmarAsistencia, cancelarAsistencia } from "@/actions/asistencia.actions";
import { cn } from "@/lib/utils";

interface ProximoPartidoClientProps {
  partidoId: string;
  jugadorId: string;
  miAsistencia: boolean | null;
}

export function ProximoPartidoClient({
  partidoId,
  jugadorId,
  miAsistencia,
}: ProximoPartidoClientProps) {
  const [asistencia, setAsistencia] = useState<boolean | null>(miAsistencia);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (asistencia === true) {
        await cancelarAsistencia(partidoId, jugadorId);
        setAsistencia(false);
      } else {
        await confirmarAsistencia(partidoId, jugadorId, "asisto");
        setAsistencia(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={cn(
          "relative flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold shadow-sm transition-all duration-200 active:scale-[0.97] disabled:opacity-60 overflow-hidden group",
          asistencia
            ? "bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100"
            : "bg-gradient-to-r from-[#c9952a] to-[#d4af37] text-white hover:from-[#b8860b] hover:to-[#c9952a]"
        )}
      >
        {loading ? (
          <div className={cn(
            "h-5 w-5 animate-spin rounded-full border-2 border-t-transparent",
            asistencia ? "border-red-400" : "border-white"
          )} />
        ) : asistencia ? (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            No voy a ir
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            ¡Voy a jugar!
          </>
        )}
      </button>

      {asistencia && (
        <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-[#0d9488] animate-fade-in">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          Confirmaste que vas a jugar
        </div>
      )}
    </div>
  );
}
