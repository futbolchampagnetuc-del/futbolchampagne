import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PerfilForm } from "@/components/features/perfil/PerfilForm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: jugadorRaw } = await supabase
    .from("jugadores")
    .select("*")
    .eq("id", user.id);

  const jugador = jugadorRaw && jugadorRaw.length > 0
    ? jugadorRaw[0] as unknown as {
        id: string;
        nombre_completo: string;
        email: string;
        foto_url: string | null;
        altura: number | null;
        peso: number | null;
        edad: number | null;
        pie_habil: string | null;
        numero_dorsal: number | null;
        equipo_favorito: string | null;
        caracteristica_juego: string | null;
        escudo_equipo_url: string | null;
        created_at: string;
        updated_at: string;
      }
    : null;

  const { data: rankingRaw } = await supabase
    .from("rankings")
    .select("*")
    .eq("jugador_id", user.id);

  const ranking = rankingRaw && rankingRaw.length > 0
    ? rankingRaw[0] as unknown as {
        partidos_jugados: number;
        partidos_ganados: number;
        partidos_perdidos: number;
        partidos_empatados: number;
        total_goles: number;
        promedio_estrellas: number;
        total_votos_recibidos: number;
      }
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>

      <PerfilForm jugador={jugador} />

      {ranking && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Mis Estadísticas
          </h2>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-2xl font-bold text-blue-600">
                {ranking.partidos_jugados}
              </p>
              <p className="text-xs text-gray-500">Jugados</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <p className="text-2xl font-bold text-green-600">
                {ranking.total_goles}
              </p>
              <p className="text-xs text-gray-500">Goles</p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-3">
              <p className="text-2xl font-bold text-yellow-600">
                {ranking.partidos_ganados}
              </p>
              <p className="text-xs text-gray-500">Ganados</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-2xl font-bold text-red-600">
                {ranking.partidos_perdidos}
              </p>
              <p className="text-xs text-gray-500">Perdidos</p>
            </div>
          </div>
        </div>
      )}

      <form action="/auth/signout" method="post" className="pt-4">
        <button
          type="submit"
          className="w-full rounded-xl border border-red-200 px-6 py-3 text-sm font-semibold text-red-600 transition-all active:scale-[0.98]"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
