"use client";

import { useState } from "react";
import { actualizarPerfil, subirFoto } from "@/actions/perfil.actions";
import { cn } from "@/lib/utils";
import { Camera, Check, Loader2, Save, X } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface PerfilFormProps {
  jugador: any;
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

const TALLES = ["S", "M", "L", "XL", "XXL"];

export function PerfilForm({ jugador }: PerfilFormProps) {
  const [formData, setFormData] = useState({
    nombre_completo: jugador?.nombre_completo || "",
    altura: jugador?.altura?.toString() || "",
    peso: jugador?.peso?.toString() || "",
    fecha_nacimiento: jugador?.fecha_nacimiento || "",
    pie_habil: jugador?.pie_habil || [],
    posiciones: jugador?.posiciones || [],
    numero_dorsal: jugador?.numero_dorsal?.toString() || "",
    equipo_favorito: jugador?.equipo_favorito || "",
    caracteristica_juego: jugador?.caracteristica_juego || "",
    talle_camiseta: jugador?.talle_camiseta || "",
  });
  
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayToggle = (field: "posiciones" | "pie_habil", value: string) => {
    const current = formData[field] as string[];
    if (current.includes(value)) {
      setFormData({ ...formData, [field]: current.filter(v => v !== value) });
    } else {
      setFormData({ ...formData, [field]: [...current, value] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await actualizarPerfil({
        nombre_completo: formData.nombre_completo,
        altura: formData.altura ? parseInt(formData.altura) : null,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        pie_habil: formData.pie_habil,
        posiciones: formData.posiciones,
        numero_dorsal: formData.numero_dorsal
          ? parseInt(formData.numero_dorsal)
          : null,
        equipo_favorito: formData.equipo_favorito || null,
        caracteristica_juego: formData.caracteristica_juego || null,
        talle_camiseta: formData.talle_camiseta || null,
      });
      setMessage({ type: "success", text: "Perfil actualizado correctamente" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error al guardar",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("foto", file);
      await subirFoto(formData);
      setMessage({ type: "success", text: "Foto de perfil actualizada" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error al subir foto",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Foto de Perfil */}
      <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-border bg-card shadow-sm">
        <div className="relative mb-4 group">
          {jugador?.foto_url ? (
            <img
              src={jugador.foto_url}
              alt="Foto de perfil"
              className="h-28 w-28 rounded-full object-cover shadow-sm ring-4 ring-background"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-accent text-4xl font-bold text-accent-foreground shadow-sm ring-4 ring-background">
              {jugador?.nombre_completo?.charAt(0) || "?"}
            </div>
          )}
          <label className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-all active:scale-95 hover:bg-primary/90">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFotoUpload}
              disabled={uploading}
            />
          </label>
        </div>
        <p className="text-sm font-medium text-foreground">{formData.nombre_completo || "Usuario"}</p>
        <p className="text-xs text-muted-foreground">{jugador?.email}</p>
      </div>

      {/* Alertas */}
      {message && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg border p-4 text-sm animate-scale-in",
            message.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
              : "border-destructive/20 bg-destructive/10 text-destructive"
          )}
        >
          {message.type === "success" ? <Check className="h-5 w-5 shrink-0" /> : <X className="h-5 w-5 shrink-0" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Formulario de Datos */}
      <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Información Básica</h3>
          
          <InputField
            label="Nombre completo"
            name="nombre_completo"
            value={formData.nombre_completo}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Fecha de Nacimiento"
              name="fecha_nacimiento"
              type="date"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
            />
            <InputField
              label="Talle Camiseta"
              name="talle_camiseta"
              value={formData.talle_camiseta}
              onChange={handleChange}
              placeholder="Ej: M, L, XL"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Altura (cm)"
              name="altura"
              type="number"
              value={formData.altura}
              onChange={handleChange}
              placeholder="175"
            />
            <InputField
              label="Peso (kg)"
              name="peso"
              type="number"
              step="0.1"
              value={formData.peso}
              onChange={handleChange}
              placeholder="70.5"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Perfil Futbolístico</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Número de dorsal preferido"
              name="numero_dorsal"
              type="number"
              value={formData.numero_dorsal}
              onChange={handleChange}
              placeholder="10"
            />
            <SelectField
              label="Característica Principal"
              name="caracteristica_juego"
              value={formData.caracteristica_juego}
              onChange={handleChange}
              options={CARACTERISTICAS.map((c) => ({
                value: c,
                label: c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
              }))}
              placeholder="Elegir..."
            />
          </div>

          <InputField
            label="Equipo favorito"
            name="equipo_favorito"
            placeholder="Ej: Boca, River..."
            value={formData.equipo_favorito}
            onChange={handleChange}
          />

          {/* Posiciones Multi Select */}
          <div className="pt-2">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Posiciones que jugás
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

          {/* Pie Habil Multi Select (por si maneja ambos) */}
          <div className="pt-2">
            <label className="mb-2 block text-sm font-medium text-foreground">
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
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all active:scale-[0.98] hover:bg-primary/90 disabled:opacity-70"
      >
        {saving ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Save className="h-5 w-5" />
        )}
        {saving ? "Guardando..." : "Guardar Perfil"}
      </button>
    </form>
  );
}

// Componentes Auxiliares
function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  step?: string;
}) {
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

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
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
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
