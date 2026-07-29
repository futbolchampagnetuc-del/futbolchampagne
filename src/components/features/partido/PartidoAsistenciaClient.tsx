"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmarAsistencia, cancelarAsistencia } from "@/actions/asistencia.actions";

interface PartidoAsistenciaClientProps {
  partidoId: string;
  jugadores: { id: string; nombre_completo: string }[];
  asistencias: { id: string; jugador_id: string; estado: string }[];
}

export function PartidoAsistenciaClient({ partidoId, jugadores, asistencias }: PartidoAsistenciaClientProps) {
  const router = useRouter();
  const [selectedJugador, setSelectedJugador] = useState<string>("");
  const [estado, setEstado] = useState<"asisto" | "no asisto" | "tal_vez" | "pendiente">("asisto");
  const [loading, setLoading] = useState(false);

  const handleConfirmar = async () => {
    if (!selectedJugador) return;
    setLoading(true);
    try {
      await confirmarAsistencia(partidoId, selectedJugador, estado);
      router.refresh();
      setSelectedJugador("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (jugadorId: string) => {
    setLoading(true);
    try {
      await cancelarAsistencia(partidoId, jugadorId);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-premium p-5 animate-slide-up space-y-4">
      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
        <span className="text-xl">📋</span>
        Gestionar Asistencia
      </h3>

      <div className="flex flex-col sm:flex-row gap-3">
        <select 
          className="input-premium flex-1"
          value={selectedJugador} 
          onChange={(e) => setSelectedJugador(e.target.value)}
        >
          <option value="" disabled>Seleccionar jugador...</option>
          {jugadores.map(j => (
            <option key={j.id} value={j.id}>{j.nombre_completo}</option>
          ))}
        </select>

        <select 
          className="input-premium w-full sm:w-[140px]"
          value={estado} 
          onChange={(e: any) => setEstado(e.target.value)}
        >
          <option value="asisto">Asiste</option>
          <option value="no asisto">No Asiste</option>
          <option value="tal_vez">Tal Vez</option>
        </select>

        <button 
          onClick={handleConfirmar} 
          disabled={!selectedJugador || loading} 
          className="btn-primary w-full sm:w-auto px-6 py-2"
        >
          Registrar
        </button>
      </div>

      {asistencias.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
            Jugadores Anotados ({asistencias.length})
          </p>
          <div className="space-y-2">
            {asistencias.map((a) => {
              const j = jugadores.find(x => x.id === a.jugador_id);
              return (
                <div key={a.id} className="flex items-center justify-between bg-muted/50 px-3 py-2 rounded-lg text-sm border border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{j?.nombre_completo}</span>
                    <span className={`text-[0.65rem] uppercase font-bold px-2 py-0.5 rounded-full ${
                      a.estado === 'asisto' ? 'bg-emerald-500/10 text-emerald-400' :
                      a.estado === 'no asisto' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {a.estado}
                    </span>
                  </div>
                  <button onClick={() => handleEliminar(a.jugador_id)} disabled={loading} className="text-muted-foreground hover:text-red-400 font-bold transition-colors">
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
}
