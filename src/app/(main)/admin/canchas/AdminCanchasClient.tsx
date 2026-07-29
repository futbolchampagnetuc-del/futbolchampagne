"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, MapPin, Phone, Navigation, Edit2, X } from "lucide-react";
import { crearCancha, eliminarCancha, actualizarCancha } from "@/actions/canchas.actions";

export function AdminCanchasClient({ canchas }: { canchas: any[] }) {
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [coordenadas, setCoordenadas] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setNombre("");
    setDireccion("");
    setTelefono("");
    setCoordenadas("");
  };

  const handleEditClick = (c: any) => {
    setEditingId(c.id);
    setNombre(c.nombre);
    setDireccion(c.direccion);
    setTelefono(c.telefono_contacto || "");
    setCoordenadas(c.coordenadas || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!nombre.trim() || !direccion.trim()) return;
    try {
      setLoading(true);
      let res;
      if (editingId) {
        res = await actualizarCancha(editingId, { 
          nombre, direccion,
          telefono_contacto: telefono || null,
          coordenadas: coordenadas || null
        });
      } else {
        res = await crearCancha({ 
          nombre, direccion,
          telefono_contacto: telefono || undefined,
          coordenadas: coordenadas || undefined
        });
      }
      if (res.success) resetForm();
      else alert(res.error || "Error al guardar la cancha");
    } catch (error) {
      console.error(error);
      alert("Error al guardar la cancha");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta cancha?")) return;
    try {
      setLoading(true);
      const res = await eliminarCancha(id);
      if (!res.success) alert(res.error || "Error al eliminar");
      else if (editingId === id) resetForm();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar");
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
              {editingId ? "Editar Cancha" : "Nueva Cancha"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {editingId ? "Modificá los datos del complejo" : "Agregar un nuevo complejo o sede"}
            </p>
          </div>
          {editingId && (
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground transition-colors bg-muted p-2 rounded-full h-10 w-10 flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Nombre del Complejo *</label>
              <input className="input-premium" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: El Último 10" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Dirección *</label>
              <input className="input-premium" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Ej: Av. Libertador 1234" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Teléfono de Contacto</label>
              <input className="input-premium" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ej: 11 1234 5678" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Google Maps (URL/Coords)</label>
              <input className="input-premium" value={coordenadas} onChange={(e) => setCoordenadas(e.target.value)} placeholder="URL o Lat, Lng" />
            </div>
          </div>
          <button 
            onClick={handleSave} 
            disabled={loading || !nombre.trim() || !direccion.trim()} 
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2 text-sm font-bold"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? "Guardar Cambios" : "Agregar Cancha"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg text-foreground">Canchas Existentes ({canchas.length})</h3>
        {canchas.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No hay canchas registradas.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {canchas.map((c) => (
              <div key={c.id} className="card-premium p-4 flex items-center justify-between group overflow-hidden">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-bold text-foreground text-base sm:text-lg truncate">{c.nombre}</span>
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-xs sm:text-sm text-muted-foreground flex items-center truncate">
                      <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5 text-[#d4af37] shrink-0" /> <span className="truncate">{c.direccion}</span>
                    </span>
                    {c.telefono_contacto && (
                      <span className="text-xs sm:text-sm text-muted-foreground flex items-center truncate">
                        <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5 text-[#d4af37] shrink-0" /> <span className="truncate">{c.telefono_contacto}</span>
                      </span>
                    )}
                    {c.coordenadas && (
                      <span className="text-xs sm:text-sm text-muted-foreground flex items-center truncate">
                        <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5 text-[#d4af37] shrink-0" /> <span className="truncate">{c.coordenadas}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-row gap-1.5 sm:gap-2 ml-2 sm:ml-4 shrink-0">
                  <button onClick={() => handleEditClick(c)} disabled={loading}
                    className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Editar cancha">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} disabled={loading}
                    className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    title="Eliminar cancha">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
