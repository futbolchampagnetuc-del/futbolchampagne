"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { actualizarPartido } from "@/actions/partidos.actions";
import { Loader2, Settings2 } from "lucide-react";

interface PartidoAdminPanelProps {
  partidoId: string;
  estado: string;
  equipoAGoles: number | null;
  equipoBGoles: number | null;
  equipoANombre: string;
  equipoBNombre: string;
}

export function PartidoAdminPanelClient({
  partidoId,
  estado: initialEstado,
  equipoAGoles: initialGolesA,
  equipoBGoles: initialGolesB,
  equipoANombre,
  equipoBNombre,
}: PartidoAdminPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [estado, setEstado] = useState(initialEstado);
  const [golesA, setGolesA] = useState<number | "">(initialGolesA !== null ? initialGolesA : "");
  const [golesB, setGolesB] = useState<number | "">(initialGolesB !== null ? initialGolesB : "");

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await actualizarPartido(partidoId, {
        estado,
        equipo_a_goles: golesA === "" ? null : golesA,
        equipo_b_goles: golesB === "" ? null : golesB,
      });
      router.refresh();
      alert("Partido actualizado exitosamente");
    } catch (error) {
      console.error(error);
      alert("Hubo un error al actualizar el partido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-premium border-[#d4af37]/30 shadow-lg mb-6 p-5">
      <div className="mb-4">
        <h2 className="text-[#1a1a2e] text-lg font-bold flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-[#d4af37]" />
          Administrar Partido
        </h2>
        <p className="text-sm text-[#6b7280]">
          Cambiá el estado del partido y el resultado final
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-[#1a1a2e]">Estado del Partido</label>
          <select 
            className="input-premium w-full"
            value={estado} 
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="programado">Programado</option>
            <option value="jugando">Jugando</option>
            <option value="finalizado">Finalizado</option>
            <option value="suspendido">Suspendido</option>
          </select>
        </div>

        {(estado === "finalizado" || estado === "jugando") && (
          <div className="grid grid-cols-2 gap-4 bg-[#faf8f5] p-4 rounded-xl border border-[#e5e0d8]/50">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6b7280]">{equipoANombre}</label>
              <input
                type="number"
                min="0"
                value={golesA}
                onChange={(e) => setGolesA(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Goles"
                className="input-premium w-full text-center font-bold text-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6b7280]">{equipoBNombre}</label>
              <input
                type="number"
                min="0"
                value={golesB}
                onChange={(e) => setGolesB(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Goles"
                className="input-premium w-full text-center font-bold text-lg"
              />
            </div>
          </div>
        )}

        <button 
          onClick={handleUpdate} 
          disabled={loading} 
          className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
