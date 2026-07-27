"use client";

import { useState } from "react";
import { crearJugador, actualizarJugador, eliminarJugador, subirFotoJugador } from "@/actions/jugadores.actions";
import { cn } from "@/lib/utils";
import { Camera, Edit2, Loader2, Plus, Trash2, X, Check } from "lucide-react";

interface JugadorData {
  id: string;
  nombre_completo: string;
  email: string;
  foto_url: string | null;
  altura: number | null;
  peso: number | null;
  fecha_nacimiento: string | null;
  pie_habil: string[] | null;
  posiciones: string[] | null;
  numero_dorsal: number | null;
  equipo_favorito: string | null;
  caracteristica_juego: string | null;
  talle_camiseta: string | null;
  escudo_equipo_url: string | null;
  created_at: string;
  updated_at: string;
}

const CARACTERISTICAS = [
  "velocidad",
  "técnica",
  "físico",
  "visión",
  "defensa",
  "arquero",
  "capacidad_aérea",
  "liderazgo",
];

const POSICIONES = [
  "Arquero",
  "Defensor",
  "Lateral",
  "Volante",
  "Enganche",
  "Delantero"
];

const PIES = ["Derecho", "Izquierdo", "Ambos"];

interface AdminJugadoresClientProps {
  jugadores: JugadorData[];
}

export function AdminJugadoresClient({ jugadores }: AdminJugadoresClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const initialFormState = {
    nombre_completo: "",
    email: "",
    numero_dorsal: "",
    equipo_favorito: "",
    caracteristica_juego: "",
    pie_habil: [] as string[],
    posiciones: [] as string[],
    talle_camiseta: "",
    altura: "",
    peso: "",
    fecha_nacimiento: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [saving, setSaving] = useState(false);

  const openNewForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setShowForm(true);
    setMessage(null);
  };

  const openEditForm = (j: JugadorData) => {
    setFormData({
      nombre_completo: j.nombre_completo,
      email: j.email,
      numero_dorsal: j.numero_dorsal?.toString() || "",
      equipo_favorito: j.equipo_favorito || "",
      caracteristica_juego: j.caracteristica_juego || "",
      pie_habil: j.pie_habil || [],
      posiciones: j.posiciones || [],
      talle_camiseta: j.talle_camiseta || "",
      altura: j.altura?.toString() || "",
      peso: j.peso?.toString() || "",
      fecha_nacimiento: j.fecha_nacimiento || "",
    });
    setEditingId(j.id);
    setShowForm(true);
    setMessage(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayToggle = (field: "posiciones" | "pie_habil", value: string) => {
    const current = formData[field];
    if (current.includes(value)) {
      setFormData({ ...formData, [field]: current.filter((v) => v !== value) });
    } else {
      setFormData({ ...formData, [field]: [...current, value] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const data = {
        nombre_completo: formData.nombre_completo,
        email: formData.email,
        numero_dorsal: formData.numero_dorsal ? parseInt(formData.numero_dorsal) : null,
        equipo_favorito: formData.equipo_favorito || null,
        caracteristica_juego: formData.caracteristica_juego || null,
        pie_habil: formData.pie_habil.length > 0 ? formData.pie_habil : null,
        posiciones: formData.posiciones.length > 0 ? formData.posiciones : null,
        talle_camiseta: formData.talle_camiseta || null,
        altura: formData.altura ? parseInt(formData.altura) : null,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        fecha_nacimiento: formData.fecha_nacimiento || null,
      };

      if (editingId) {
        await actualizarJugador(editingId, data);
        setMessage({ type: "success", text: "Jugador actualizado" });
      } else {
        await crearJugador(data);
        setMessage({ type: "success", text: "Jugador creado" });
        setFormData(initialFormState);
      }
      setShowForm(false);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar a "${name}"?`)) return;
    try {
      await eliminarJugador(id);
      setMessage({ type: "success", text: "Jugador eliminado" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Error" });
    }
  };

  const handleFotoUpload = async (jugadorId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const form = new FormData();
      form.append("foto", file);
      await subirFotoJugador(jugadorId, form);
      setMessage({ type: "success", text: "Foto actualizada" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Error al subir foto" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Mensajes Generales */}
      {message && !showForm && (
        <div className={cn(
          "flex items-center gap-3 rounded-lg border p-4 text-sm animate-scale-in",
          message.type === "success"
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
            : "border-destructive/20 bg-destructive/10 text-destructive"
        )}>
          {message.type === "success" ? <Check className="h-5 w-5 shrink-0" /> : <X className="h-5 w-5 shrink-0" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Botón nuevo */}
      {!showForm && (
        <button
          onClick={openNewForm}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all active:scale-[0.98] hover:bg-primary/90"
        >
          <Plus className="h-5 w-5" />
          Nuevo Jugador
        </button>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground">
              {editingId ? "Editar Jugador" : "Nuevo Jugador"}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-full p-2 text-muted-foreground hover:bg-accent transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <InputField label="Nombre completo" name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} required />
              
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                <InputField label="Dorsal" name="numero_dorsal" type="number" value={formData.numero_dorsal} onChange={handleChange} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Fecha de Nacimiento" name="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={handleChange} />
                <InputField label="Talle Camiseta" name="talle_camiseta" value={formData.talle_camiseta} onChange={handleChange} placeholder="Ej: L" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="Altura (cm)" name="altura" type="number" value={formData.altura} onChange={handleChange} />
                <InputField label="Peso (kg)" name="peso" type="number" step="0.1" value={formData.peso} onChange={handleChange} />
              </div>

              <SelectField
                label="Característica"
                name="caracteristica_juego"
                value={formData.caracteristica_juego}
                onChange={handleChange}
                options={CARACTERISTICAS.map(c => ({ value: c, label: c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) }))}
                placeholder="Elegir..."
              />

              <InputField label="Equipo favorito" name="equipo_favorito" value={formData.equipo_favorito} onChange={handleChange} />

              {/* Posiciones Multi Select */}
              <div className="pt-2">
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Posiciones
                </label>
                <div className="flex flex-wrap gap-2">
                  {POSICIONES.map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => handleArrayToggle("posiciones", pos)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium transition-all border",
                        formData.posiciones.includes(pos)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-accent/50 text-muted-foreground hover:bg-accent"
                      )}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pie Habil Multi Select */}
              <div className="pt-2">
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Pie hábil
                </label>
                <div className="flex flex-wrap gap-2">
                  {PIES.map((pie) => (
                    <button
                      key={pie}
                      type="button"
                      onClick={() => handleArrayToggle("pie_habil", pie)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium transition-all border",
                        formData.pie_habil.includes(pie)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-accent/50 text-muted-foreground hover:bg-accent"
                      )}
                    >
                      {pie}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <button type="submit" disabled={saving} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all active:scale-[0.98] hover:bg-primary/90 disabled:opacity-70">
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
              {saving ? "Guardando..." : (editingId ? "Guardar cambios" : "Crear jugador")}
            </button>
          </form>
        </div>
      )}

      {/* Lista de jugadores */}
      <div className="space-y-3">
        {jugadores.map((j) => (
          <div key={j.id} className="rounded-xl border border-border bg-card p-4 shadow-sm animate-slide-up flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {/* Foto */}
              <div className="relative shrink-0 group">
                {j.foto_url ? (
                  <img src={j.foto_url} alt={j.nombre_completo} className="h-12 w-12 rounded-full object-cover ring-2 ring-background" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg font-bold text-accent-foreground ring-2 ring-background">
                    {j.nombre_completo.charAt(0)}
                  </div>
                )}
                <label className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
                  <Camera className="h-3 w-3" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFotoUpload(j.id, e)} />
                </label>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground truncate">{j.nombre_completo}</p>
                  {j.numero_dorsal && (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">#{j.numero_dorsal}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {j.posiciones && j.posiciones.length > 0 && (
                    <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">
                      {j.posiciones.join(", ")}
                    </span>
                  )}
                  {j.pie_habil && j.pie_habil.length > 0 && (
                    <span className="text-[10px] border border-border text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                      {j.pie_habil.join(", ")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => openEditForm(j)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-muted-foreground hover:bg-accent/80 transition-all active:scale-95"
                title="Editar"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(j.id, j.nombre_completo)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all active:scale-95"
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componentes Auxiliares
function InputField({ label, name, type = "text", value, onChange, placeholder, required, step }: any) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        step={step}
        inputMode={type === "number" ? "numeric" : undefined}
        className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, placeholder }: any) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full appearance-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
