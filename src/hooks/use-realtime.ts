"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type TableName = "asistencia" | "partidos";

export function useRealtimeSubscription<T extends Record<string, unknown>>(
  table: TableName,
  filter?: string
) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Cargar datos iniciales
    const loadInitial = async () => {
      let query = supabase.from(table).select("*");
      if (filter) {
        query = query.or(filter);
      }
      const { data: initial } = await query;
      if (initial) {
        setData(initial as T[]);
      }
      setIsLoading(false);
    };

    loadInitial();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: table,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (payload.eventType === "INSERT") {
            setData((prev) => [...prev, payload.new as T]);
          } else if (payload.eventType === "UPDATE") {
            setData((prev) =>
              prev.map((item) =>
                (item as Record<string, unknown>).id ===
                (payload.new as Record<string, unknown>).id
                  ? (payload.new as T)
                  : item
              )
            );
          } else if (payload.eventType === "DELETE") {
            setData((prev) =>
              prev.filter(
                (item) =>
                  (item as Record<string, unknown>).id !==
                  (payload.old as Record<string, unknown>).id
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter]);

  return { data, isLoading };
}
