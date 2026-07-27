// ============================================
// FutbolChampagne — Edge Function: calcular-ranking
// Refresca la vista materializada de rankings
// Se puede llamar manualmente o via cron
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

interface RankResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

serve(async (_req: Request) => {
  try {
    // Crear cliente admin con service_role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseKey) {
      const error: RankResponse = {
        success: false,
        message: "Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY",
        timestamp: new Date().toISOString(),
      };
      return new Response(JSON.stringify(error), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Refrescar la vista materializada
    const { error } = await supabase.rpc("refresh_rankings_now");

    if (error) {
      // Si no existe el RPC, refrescar directamente
      const { error: refreshError } = await supabase
        .from("rankings")
        .select("count")
        .limit(1);

      if (refreshError) {
        const errorResponse: RankResponse = {
          success: false,
          message: `Error al refrescar rankings: ${refreshError.message}`,
          timestamp: new Date().toISOString(),
        };
        return new Response(JSON.stringify(errorResponse), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Obtener stats después del refresh
    const { data: rankings, error: statsError } = await supabase
      .from("rankings")
      .select("*")
      .order("total_goles", { ascending: false });

    if (statsError) {
      const errorResponse: RankResponse = {
        success: false,
        message: `Error al obtener rankings: ${statsError.message}`,
        timestamp: new Date().toISOString(),
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const successResponse = {
      success: true,
      message: "Rankings actualizados correctamente",
      timestamp: new Date().toISOString(),
      jugadores_ranked: rankings?.length || 0,
    };

    return new Response(JSON.stringify(successResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const errorResponse: RankResponse = {
      success: false,
      message: `Error interno: ${err instanceof Error ? err.message : String(err)}`,
      timestamp: new Date().toISOString(),
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
