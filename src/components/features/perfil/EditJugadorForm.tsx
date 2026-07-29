"use client";

import { useState } from "react";
import { actualizarJugador } from "@/actions/jugadores.actions";
import { Pencil, X, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface JugadorData {
  id: string;
  nombre_completo: string;
  altura: number | null;
  peso: number | null;
  fecha_nacimiento: string | null;
  pie_habil: string[] | null;
  numero_dorsal: number | null;
  equipo_favorito: string | null;
  caracteristica_juego: string | null;
  talle_camiseta: string | null;
  posiciones: string[] | null;
}

export function EditJugadorForm({ jugador }: { jugador: JugadorData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre_completo: jugador.nombre_completo,
    altura: jugador.altura ?? null,
    peso: jugador.peso ?? null,
    fecha_nacimiento: jugador.fecha_nacimiento ?? "",
    pie_habil: jugador.pie_habil?.join(", ") ?? "",
    numero_dorsal: jugador.numero_dorsal ?? null,
    equipo_favorito: jugador.equipo_favorito ?? "",
    caracteristica_juego: jugador.caracteristica_juego ?? "",
    talle_camiseta: jugador.talle_camiseta ?? "",
    posiciones: jugador.posiciones?.join(", ") ?? "",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await actualizarJugador(jugador.id, {
        nombre_completo: form.nombre_completo,
        altura: form.altura,
        peso: form.peso,
        fecha_nacimiento: form.fecha_nacimiento || null,
        pie_habil: form.pie_habil ? form.pie_habil.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        numero_dorsal: form.numero_dorsal,
        equipo_favorito: form.equipo_favorito || null,
        caracteristica_juego: form.caracteristica_juego || null,
        talle_camiseta: form.talle_camiseta || null,
        posiciones: form.posiciones ? form.posiciones.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      });
      toast.success("Jugador actualizado");
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: "nombre_completo", label: "Nombre", type: "text" },
    { key: "numero_dorsal", label: "Dorsal", type: "number" },
    { key: "altura", label: "Altura (cm)", type: "number" },
    { key: "peso", label: "Peso (kg)", type: "number" },
    { key: "fecha_nacimiento", label: "Fecha Nac.", type: "date" },
    { key: "talle_camiseta", label: "Talle Camiseta", type: "text" },
    { key: "equipo_favorito", label: "Equipo Favorito", type: "text" },
    { key: "caracteristica_juego", label: "Estilo de Juego", type: "text" },
    { key: "pie_habil", label: "Pie Hábil (separar con coma)", type: "text" },
    { key: "posiciones", label: "Posiciones (separar con coma)", type: "text" },
  ] as const;

  return (
    <>
      <button
        onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        {isEditing ? (
          <><X className="w-3.5 h-3.5" /> Cancelar</>
        ) : (
          <><Pencil className="w-3.5 h-3.5" /> Editar perfil</>
        )}
      </button>

      {isEditing && (
        <div className="space-y-3 mt-4 pt-4 border-t border-border">
          {fields.map(({ key, label, type }) => (
            <div key={key}>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>
              <input
                type={type}
                value={(form as any)[key] ?? ""}
                onChange={(e) => {
                  const val = type === "number" ? (e.target.value ? Number(e.target.value) : null) : e.target.value;
                  setForm((prev) => ({ ...prev, [key]: val }));
                }}
                className="w-full rounded-xl bg-muted border border-border px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
              />
            </div>
          ))}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-gold w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
            ) : (
              <><Save className="w-4 h-4" /> Guardar Cambios</>
            )}
          </button>
        </div>
      )}
    </>
  );
}
