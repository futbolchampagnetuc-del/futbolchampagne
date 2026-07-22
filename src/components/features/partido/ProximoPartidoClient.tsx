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
        await cancelarAsistencia(partidoId);
        setAsistencia(false);
      } else {
        await confirmarAsistencia(partidoId);
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
          "flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-60",
          asistencia
            ? "bg-red-50 text-red-700 ring-1 ring-red-200"
            : "bg-green-600 text-white hover:bg-green-700"
        )}
      >
        {loading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : asistencia ? (
          <>
            <span>❌</span>
            No voy a ir
          </>
        ) : (
          <>
            <span>✅</span>
            ¡Voy a jugar!
          </>
        )}
      </button>

      {asistencia && (
        <p className="text-center text-sm text-green-600">
          ✅ Confirmaste que vas a jugar
        </p>
      )}
    </div>
  );
}
