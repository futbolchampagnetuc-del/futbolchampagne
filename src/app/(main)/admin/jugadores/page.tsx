import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminJugadoresClient } from "./AdminJugadoresClient";

export const dynamic = "force-dynamic";

export default async function AdminJugadoresPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: jugadoresRaw } = await supabase
    .from("jugadores")
    .select("*")
    .order("nombre_completo");

  const jugadores = jugadoresRaw as unknown as {
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
  }[] || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1a1a2e]">
            Administrar Jugadores
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            {jugadores.length} jugadores registrados
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4af37]/10">
          <svg className="h-5 w-5 text-[#c9952a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
          </svg>
        </div>
      </div>

      <AdminJugadoresClient jugadores={jugadores} />
    </div>
  );
}
