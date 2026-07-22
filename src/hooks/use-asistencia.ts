"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { confirmarAsistencia, cancelarAsistencia } from "@/actions/asistencia.actions";

export function useAsistencia(partidoId: string) {
  const [loading, setLoading] = useState(false);

  const toggleAsistencia = useCallback(
    async (confirmado: boolean) => {
      setLoading(true);
      try {
        if (confirmado) {
          await cancelarAsistencia(partidoId);
        } else {
          await confirmarAsistencia(partidoId);
        }
      } catch (error) {
        console.error("Error al cambiar asistencia:", error);
      } finally {
        setLoading(false);
      }
    },
    [partidoId]
  );

  return { toggleAsistencia, loading };
}
