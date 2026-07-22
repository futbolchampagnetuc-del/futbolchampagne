"use client";

import { useState } from "react";
import { actualizarPerfil, subirFoto } from "@/actions/perfil.actions";
import { cn } from "@/lib/utils";

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

const PIES = ["izquierdo", "derecho", "ambidiestro"];

export function PerfilForm({ jugador }: PerfilFormProps) {
  const [formData, setFormData] = useState({
    nombre_completo: jugador?.nombre_completo || "",
    altura: jugador?.altura?.toString() || "",
    peso: jugador?.peso?.toString() || "",
    edad: jugador?.edad?.toString() || "",
    pie_habil: jugador?.pie_habil || "",
    numero_dorsal: jugador?.numero_dorsal?.toString() || "",
    equipo_favorito: jugador?.equipo_favorito || "",
    caracteristica_juego: jugador?.caracteristica_juego || "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await actualizarPerfil({
        nombre_completo: formData.nombre_completo,
        altura: formData.altura ? parseInt(formData.altura) : null,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        edad: formData.edad ? parseInt(formData.edad) : null,
        pie_habil: formData.pie_habil as "izquierdo" | "derecho" | "ambidiestro" | null,
        numero_dorsal: formData.numero_dorsal
          ? parseInt(formData.numero_dorsal)
          : null,
        equipo_favorito: formData.equipo_favorito || null,
        caracteristica_juego: formData.caracteristica_juego || null,
      });
      setMessage({ type: "success", text: "Perfil actualizado ✅" });
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
      setMessage({ type: "success", text: "Foto actualizada ✅" });
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Foto */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          {jugador?.foto_url ? (
            <img
              src={jugador.foto_url}
              alt="Foto de perfil"
              className="h-24 w-24 rounded-full object-cover shadow-md"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-700 shadow-md">
              {jugador?.nombre_completo?.charAt(0) || "?"}
            </div>
          )}
          <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-green-600 text-white shadow-md transition-all active:scale-90">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
            </svg>
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
        {uploading && (
          <p className="text-sm text-gray-500">Subiendo foto...</p>
        )}
      </div>

      {/* Mensaje */}
      {message && (
        <div
          className={cn(
            "rounded-lg p-3 text-sm",
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-600"
          )}
        >
          {message.text}
        </div>
      )}

      {/* Campos */}
      <div className="space-y-4">
        <InputField
          label="Nombre completo"
          name="nombre_completo"
          value={formData.nombre_completo}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Altura (cm)"
            name="altura"
            type="number"
            value={formData.altura}
            onChange={handleChange}
          />
          <InputField
            label="Peso (kg)"
            name="peso"
            type="number"
            step="0.1"
            value={formData.peso}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Edad"
            name="edad"
            type="number"
            value={formData.edad}
            onChange={handleChange}
          />
          <SelectField
            label="Pie hábil"
            name="pie_habil"
            value={formData.pie_habil}
            onChange={handleChange}
            options={PIES.map((p) => ({
              value: p,
              label: p.charAt(0).toUpperCase() + p.slice(1),
            }))}
          />
        </div>

        <InputField
          label="Número de dorsal"
          name="numero_dorsal"
          type="number"
          value={formData.numero_dorsal}
          onChange={handleChange}
        />

        <InputField
          label="Equipo favorito"
          name="equipo_favorito"
          placeholder="Ej: Boca, River, Real Madrid..."
          value={formData.equipo_favorito}
          onChange={handleChange}
        />

        <SelectField
          label="Característica de juego"
          name="caracteristica_juego"
          value={formData.caracteristica_juego}
          onChange={handleChange}
          options={CARACTERISTICAS.map((c) => ({
            value: c,
            label: c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          }))}
          placeholder="Seleccioná tu característica"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-60"
      >
        {saving ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          "Guardar perfil"
        )}
      </button>
    </form>
  );
}

// Componentes auxiliares
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
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        step={step}
        inputMode={
          type === "number" ? "numeric" : undefined
        }
        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
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
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
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
