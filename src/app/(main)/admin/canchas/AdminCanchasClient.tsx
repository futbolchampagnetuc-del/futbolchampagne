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
    
    // Scroll to top where form is
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!nombre.trim() || !direccion.trim()) return;
    try {
      setLoading(true);
      
      let res;
      if (editingId) {
        res = await actualizarCancha(editingId, { 
          nombre, 
          direccion,
          telefono_contacto: telefono || null,
          coordenadas: coordenadas || null
        });
      } else {
        res = await crearCancha({ 
          nombre, 
          direccion,
          telefono_contacto: telefono || undefined,
          coordenadas: coordenadas || undefined
        });
      }

      if (res.success) {
        resetForm();
      } else {
        alert(res.error || "Error al guardar la cancha");
      }
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
      if (!res.success) {
        alert(res.error || "Error al eliminar la cancha");
      } else if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error(error);
      alert("Error al eliminar la cancha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`card-premium p-5 transition-all ${editingId ? 'ring-2 ring-[#d4af37]' : ''}`}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1a1a2e]">
              {editingId ? "Editar Cancha" : "Nueva Cancha"}
            </h2>
            <p className="text-sm text-[#6b7280]">
              {editingId ? "Modificá los datos del complejo" : "Agregar un nuevo complejo o sede"}
            </p>
          </div>
          {editingId && (
            <button onClick={resetForm} className="text-[#6b7280] hover:text-[#1a1a2e] transition-colors bg-[#f0ede6] p-2 rounded-full">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1a1a2e]">Nombre del Complejo *</label>
              <input 
                className="input-premium w-full"
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                placeholder="Ej: El Último 10" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1a1a2e]">Dirección *</label>
              <input 
                className="input-premium w-full"
                value={direccion} 
                onChange={(e) => setDireccion(e.target.value)} 
                placeholder="Ej: Av. Libertador 1234" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1a1a2e]">Teléfono de Contacto</label>
              <input 
                className="input-premium w-full"
                value={telefono} 
                onChange={(e) => setTelefono(e.target.value)} 
                placeholder="Ej: 11 1234 5678" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1a1a2e]">Google Maps (URL/Coords)</label>
              <input 
                className="input-premium w-full"
                value={coordenadas} 
                onChange={(e) => setCoordenadas(e.target.value)} 
                placeholder="URL o Lat, Lng" 
              />
            </div>
          </div>
          <button 
            onClick={handleSave} 
            disabled={loading || !nombre.trim() || !direccion.trim()} 
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : editingId ? (
              <Edit2 className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {editingId ? "Guardar Cambios" : "Agregar Cancha"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-[#1a1a2e]">Canchas Existentes ({canchas.length})</h3>
        {canchas.length === 0 ? (
          <p className="text-sm text-[#6b7280] text-center py-8">No hay canchas registradas.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {canchas.map((c) => (
              <div key={c.id} className="card-premium p-4 flex items-center justify-between group">
                <div className="flex flex-col">
                  <span className="font-bold text-[#1a1a2e] text-lg">{c.nombre}</span>
                  <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-2">
                    <span className="text-sm text-[#6b7280] flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#d4af37]" /> {c.direccion}
                    </span>
                    {c.telefono_contacto && (
                      <span className="text-sm text-[#6b7280] flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-1.5 text-[#d4af37]" /> {c.telefono_contacto}
                      </span>
                    )}
                    {c.coordenadas && (
                      <span className="text-sm text-[#6b7280] flex items-center">
                        <Navigation className="w-3.5 h-3.5 mr-1.5 text-[#d4af37]" /> {c.coordenadas}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 ml-4">
                  <button 
                    onClick={() => handleEditClick(c)} 
                    disabled={loading}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f0ede6] text-[#6b7280] hover:bg-[#d4af37]/20 hover:text-[#a67c2e] transition-colors"
                    title="Editar cancha"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(c.id)} 
                    disabled={loading}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    title="Eliminar cancha"
                  >
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
