"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, Calendar as CalendarIcon, MapPin, CheckCircle2, Users, Edit2, X } from "lucide-react";
import { crearPartido, eliminarPartido, actualizarPartido } from "@/actions/partidos.actions";
import { format } from "date-fns";
import Link from "next/link";

export function AdminPartidosClient({ partidos, canchas }: { partidos: any[]; canchas: any[] }) {
  const [loading, setLoading] = useState(false);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [canchaId, setCanchaId] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setFecha("");
    setHora("");
    setCanchaId("");
  };

  const handleEditClick = (p: any) => {
    setEditingId(p.id);
    const date = new Date(p.fecha_hora);
    setFecha(date.toISOString().split("T")[0]);
    setHora(date.toISOString().split("T")[1].substring(0, 5));
    setCanchaId(p.cancha_id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!fecha || !hora || !canchaId) return;
    try {
      setLoading(true);
      const fechaHora = new Date(`${fecha}T${hora}`).toISOString();
      
      if (editingId) {
        await actualizarPartido(editingId, { fecha_hora: fechaHora, cancha_id: canchaId });
      } else {
        await crearPartido({ fecha_hora: fechaHora, cancha_id: canchaId });
      }
      resetForm();
    } catch (error) {
      console.error(error);
      alert("Error al guardar el partido");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este partido?")) return;
    try {
      setLoading(true);
      await eliminarPartido(id);
    } catch (error) {
      console.error(error);
      alert("Error al eliminar el partido");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizar = async (id: string) => {
    if (!confirm("¿Marcar este partido como finalizado? Ya no se podrán sumar asistencias.")) return;
    try {
      setLoading(true);
      await actualizarPartido(id, { estado: "finalizado" });
    } catch (error) {
      console.error(error);
      alert("Error al actualizar el partido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`card-premium p-5 transition-all ${editingId ? 'ring-2 ring-[#d4af37]' : ''}`}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {editingId ? "Editar Partido" : "Nuevo Partido"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {editingId ? "Modificá la fecha, hora o cancha" : "Programar un nuevo turno"}
            </p>
          </div>
          {editingId && (
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground transition-colors bg-muted p-2 rounded-full h-10 w-10 flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Fecha</label>
              <input type="date" className="input-premium" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Hora</label>
              <input type="time" className="input-premium" value={hora} onChange={(e) => setHora(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Cancha</label>
            <select className="input-premium" value={canchaId} onChange={(e) => setCanchaId(e.target.value)}>
              <option value="" disabled>Seleccionar cancha</option>
              {canchas.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <button onClick={handleSave} disabled={loading || !fecha || !hora || !canchaId} 
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm font-bold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? "Guardar Cambios" : "Programar Partido"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg text-foreground">Partidos Programados ({partidos.length})</h3>
        {partidos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No hay partidos registrados.</p>
        ) : (
          <div className="space-y-3">
            {partidos.map((p) => {
              const date = new Date(p.fecha_hora);
              const cancha = canchas.find(c => c.id === p.cancha_id);
              
              return (
                <div key={p.id} className={`card-premium p-4 flex items-center justify-between ${p.estado === 'finalizado' ? 'opacity-60' : ''}`}>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-bold flex items-center gap-2 text-foreground">
                      <CalendarIcon className="w-4 h-4 text-[#d4af37] shrink-0" />
                      <span className="truncate">{format(date, "dd/MM/yyyy HH:mm")}</span>
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center mt-1 gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" /> {cancha?.nombre || "Sin cancha"}
                    </span>
                    <span className="text-xs uppercase font-semibold text-emerald-400 mt-2">
                      {p.estado}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    {p.estado !== "finalizado" && (
                      <div className="flex gap-1.5 sm:gap-2">
                        <Link href="/sorteo"
                          className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2.5 rounded-lg text-[10px] sm:text-sm font-medium bg-muted text-[#d4af37] hover:bg-muted/80 flex-1">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4" /><span className="hidden sm:inline">Equipos</span>
                        </Link>
                        <button onClick={() => handleFinalizar(p.id)} disabled={loading}
                          className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2.5 rounded-lg text-[10px] sm:text-sm font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 flex-1">
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" /><span className="hidden sm:inline">Finalizar</span>
                        </button>
                      </div>
                    )}
                    <div className="flex gap-1.5 sm:gap-2">
                      <button onClick={() => handleEditClick(p)} disabled={loading}
                        className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2.5 rounded-lg text-[10px] sm:text-sm font-medium bg-muted text-muted-foreground hover:text-foreground flex-1">
                        <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" /><span className="hidden sm:inline">Editar</span>
                      </button>
                      <button onClick={() => handleDelete(p.id)} disabled={loading}
                        className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2.5 rounded-lg text-[10px] sm:text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 flex-1">
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" /><span className="hidden sm:inline">Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
