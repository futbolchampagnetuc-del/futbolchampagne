"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface GolInfo {
  id: string;
  jugador_id: string;
  cantidad_goles: number;
}

interface PartidoGolesClientProps {
  partidoId: string;
  jugadorId: string;
  golesExistentes: (GolInfo & { jugador: { nombre_completo: string } })[];
  jugadores: { id: string; nombre_completo: string }[];
}

export function PartidoGolesClient({
  partidoId,
  jugadorId,
  golesExistentes,
  jugadores,
}: PartidoGolesClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [goles, setGoles] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    golesExistentes.forEach((g) => {
      if (g.jugador_id === jugadorId) {
        initial[jugadorId] = g.cantidad_goles;
      }
    });
    if (!initial[jugadorId]) initial[jugadorId] = 0;
    return initial;
  });
  const [saving, setSaving] = useState(false);

  const tieneGolRegistrado = golesExistentes.some(
    (g) => g.jugador_id === jugadorId
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const cantidad = goles[jugadorId] || 0;

      if (tieneGolRegistrado) {
        await supabase
          .from("goles_partido")
          .update({ cantidad_goles: cantidad })
          .eq("partido_id", partidoId)
          .eq("jugador_id", jugadorId);
      } else {
        await supabase.from("goles_partido").insert({
          partido_id: partidoId,
          jugador_id: jugadorId,
          cantidad_goles: cantidad,
        });
      }

      router.refresh();
    } catch (error) {
      console.error("Error al guardar goles:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-3 text-lg font-semibold text-gray-900">
        ⚽ Mis Goles
      </h3>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() =>
            setGoles({
              ...goles,
              [jugadorId]: Math.max(0, (goles[jugadorId] || 0) - 1),
            })
          }
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-600 transition-all active:scale-90"
        >
          −
        </button>

        <span className="min-w-[60px] text-center text-3xl font-bold text-gray-900">
          {goles[jugadorId] || 0}
        </span>

        <button
          type="button"
          onClick={() =>
            setGoles({
              ...goles,
              [jugadorId]: (goles[jugadorId] || 0) + 1,
            })
          }
          className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-600 transition-all active:scale-90"
        >
          +
        </button>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
      >
        {saving ? "Guardando..." : "Guardar goles"}
      </button>

      {/* Tabla de goleadores del partido */}
      {golesExistentes.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="mb-2 text-sm font-medium text-gray-600">
            Goles del partido
          </p>
          <div className="space-y-1">
            {golesExistentes
              .sort((a, b) => b.cantidad_goles - a.cantidad_goles)
              .map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-gray-700">
                    {g.jugador.nombre_completo}
                  </span>
                  <span className="font-bold text-gray-900">
                    {g.cantidad_goles}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
