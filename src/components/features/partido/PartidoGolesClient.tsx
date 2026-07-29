"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface GolInfo {
  id: string;
  jugador_id: string;
  cantidad_goles: number;
}

interface PartidoGolesClientProps {
  partidoId: string;
  golesExistentes: (GolInfo & { jugador: { nombre_completo: string } })[];
  jugadores: { id: string; nombre_completo: string }[];
}

export function PartidoGolesClient({
  partidoId,
  golesExistentes,
  jugadores,
}: PartidoGolesClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [selectedJugador, setSelectedJugador] = useState<string>("");
  const [cantidad, setCantidad] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedJugador) return;
    setSaving(true);
    try {
      const tieneGolRegistrado = golesExistentes.some((g) => g.jugador_id === selectedJugador);

      if (tieneGolRegistrado) {
        await supabase
          .from("goles_partido")
          .update({ cantidad_goles: cantidad })
          .eq("partido_id", partidoId)
          .eq("jugador_id", selectedJugador);
      } else {
        await supabase.from("goles_partido").insert({
          partido_id: partidoId,
          jugador_id: selectedJugador,
          cantidad_goles: cantidad,
        });
      }

      router.refresh();
      setSelectedJugador("");
      setCantidad(0);
    } catch (error) {
      console.error("Error al guardar goles:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card-premium p-5 animate-slide-up">
      <h3 className="mb-4 text-lg font-bold text-foreground flex items-center gap-2">
        <span className="text-xl">⚽</span>
        Registrar Goles
      </h3>

      <div className="space-y-4">
        <select 
          className="input-premium w-full"
          value={selectedJugador} 
          onChange={(e) => {
            const val = e.target.value;
            setSelectedJugador(val);
            const exist = golesExistentes.find(g => g.jugador_id === val);
            setCantidad(exist ? exist.cantidad_goles : 0);
          }}
        >
          <option value="" disabled>Seleccionar jugador</option>
          {jugadores.map((j) => (
            <option key={j.id} value={j.id}>{j.nombre_completo}</option>
          ))}
        </select>

        {selectedJugador && (
          <div className="flex items-center justify-center gap-6 mt-4">
            <button
              type="button"
              onClick={() => setCantidad(Math.max(0, cantidad - 1))}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-2xl font-bold text-muted-foreground transition-all active:scale-90 hover:bg-muted/80"
            >
              −
            </button>

            <div className="flex flex-col items-center">
              <span className="text-5xl font-extrabold text-foreground">
                {cantidad}
              </span>
              <span className="text-xs text-muted-foreground mt-1">goles</span>
            </div>

            <button
              type="button"
              onClick={() => setCantidad(cantidad + 1)}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-[#b8860b]/10 text-2xl font-bold text-[#c9952a] transition-all active:scale-90 hover:from-[#d4af37]/30 hover:to-[#b8860b]/20"
            >
              +
            </button>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !selectedJugador}
          className="btn-primary w-full mt-5 py-3 flex items-center justify-center"
        >
          {saving ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Guardar goles
            </>
          )}
        </button>
      </div>

      {/* Tabla de goleadores del partido */}
      {golesExistentes.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <p className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Goles del partido
          </p>
          <div className="space-y-1.5">
            {golesExistentes
              .sort((a, b) => b.cantidad_goles - a.cantidad_goles)
              .map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-2.5 text-sm"
                >
                  <span className="font-medium text-foreground">
                    {g.jugador.nombre_completo}
                  </span>
                  <span className="font-extrabold text-[#c9952a] text-base">
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
