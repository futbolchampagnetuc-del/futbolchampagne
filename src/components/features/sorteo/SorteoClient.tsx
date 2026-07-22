"use client";

import { useState } from "react";
import { realizarSorteo } from "@/actions/sorteo.actions";
import { AvatarWithName } from "@/components/shared/AvatarWithName";
import { cn } from "@/lib/utils";

interface SorteoClientProps {
  partidoId: string;
  asistentes: { id: string; nombre_completo: string; foto_url: string | null }[];
  asignacionActual: { jugador_id: string; equipo: string }[];
}

type SorteoMode = "random" | "balanceado";

export function SorteoClient({
  partidoId,
  asistentes,
  asignacionActual,
}: SorteoClientProps) {
  const [mode, setMode] = useState<SorteoMode>("random");
  const [equipoA, setEquipoA] = useState<
    { id: string; nombre_completo: string; foto_url: string | null }[]
  >(
    asignacionActual
      .filter((a) => a.equipo === "A")
      .map((a) => asistentes.find((j) => j.id === a.jugador_id)!)
      .filter(Boolean)
  );
  const [equipoB, setEquipoB] = useState<
    { id: string; nombre_completo: string; foto_url: string | null }[]
  >(
    asignacionActual
      .filter((a) => a.equipo === "B")
      .map((a) => asistentes.find((j) => j.id === a.jugador_id)!)
      .filter(Boolean)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSortear = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await realizarSorteo(partidoId, mode);
      setEquipoA(result.equipoA);
      setEquipoB(result.equipoB);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al sortear");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Selector de modo */}
      <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1">
        <button
          onClick={() => setMode("random")}
          className={cn(
            "flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
            mode === "random"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500"
          )}
        >
          🎲 Random
        </button>
        <button
          onClick={() => setMode("balanceado")}
          className={cn(
            "flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
            mode === "balanceado"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500"
          )}
        >
          ⚖️ Balanceado
        </button>
      </div>

      <p className="text-center text-sm text-gray-500">
        {asistentes.length} jugadores confirmados
      </p>

      {/* Botón de sorteo */}
      <button
        onClick={handleSortear}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          "🎲 ¡Sortear!"
        )}
      </button>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Resultado */}
      {(equipoA.length > 0 || equipoB.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {/* Equipo A */}
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <h3 className="mb-3 text-center font-bold text-green-800">
              🇦 Equipo A
            </h3>
            <div className="space-y-2">
              {equipoA.map((j) => (
                <div
                  key={j.id}
                  className="rounded-lg bg-white px-3 py-2 shadow-sm"
                >
                  <AvatarWithName
                    name={j.nombre_completo}
                    fotoUrl={j.foto_url}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Equipo B */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-3 text-center font-bold text-blue-800">
              🇧 Equipo B
            </h3>
            <div className="space-y-2">
              {equipoB.map((j) => (
                <div
                  key={j.id}
                  className="rounded-lg bg-white px-3 py-2 shadow-sm"
                >
                  <AvatarWithName
                    name={j.nombre_completo}
                    fotoUrl={j.foto_url}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
