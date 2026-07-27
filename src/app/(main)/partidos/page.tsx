import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDateTime, cn } from "@/lib/utils";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PartidosPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Obtener todos los partidos ordenados por fecha descendente
  const { data: partidosRaw } = await supabase
    .from("partidos")
    .select("*, cancha:canchas(*)")
    .order("fecha_hora", { ascending: false });

  const partidos = (partidosRaw || []) as unknown as {
    id: string;
    fecha_hora: string;
    estado: string;
    equipo_a_nombre: string | null;
    equipo_b_nombre: string | null;
    equipo_a_goles: number | null;
    equipo_b_goles: number | null;
    cancha: { nombre: string; direccion: string } | null;
  }[];

  // Obtener conteo de asistencias para cada partido
  const partidoIds = partidos.map((p) => p.id);
  const { data: asistenciasRaw } = await supabase
    .from("asistencia")
    .select("partido_id, confirmado")
    .in("partido_id", partidoIds);

  const asistenciasPorPartido: Record<string, { total: number; confirmados: number }> = {};
  for (const a of asistenciasRaw || []) {
    if (!asistenciasPorPartido[a.partido_id]) {
      asistenciasPorPartido[a.partido_id] = { total: 0, confirmados: 0 };
    }
    asistenciasPorPartido[a.partido_id].total++;
    if (a.confirmado) asistenciasPorPartido[a.partido_id].confirmados++;
  }

  const partidosPendientes = partidos.filter((p) => p.estado === "pendiente");
  const partidosFinalizados = partidos.filter((p) => p.estado === "finalizado");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#1a1a2e]">
          Partidos
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          {partidos.length} partidos • {partidosFinalizados.length} finalizados
        </p>
      </div>

      {/* Próximo partido destacado */}
      {partidosPendientes.length > 0 && (
        <div className="card-premium overflow-hidden border-l-4 border-l-[#d4af37]">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-[#d4af37] animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#a67c2e]">
                Próximo Partido
              </span>
            </div>
            {partidosPendientes.slice(0, 1).map((p) => (
              <Link key={p.id} href={`/partido/${p.id}`} className="block group">
                <p className="font-bold text-[#1a1a2e] group-hover:text-[#a67c2e] transition-colors">
                  {formatDateTime(p.fecha_hora)}
                </p>
                <p className="text-sm text-[#6b7280]">
                  {p.cancha?.nombre} · {p.cancha?.direccion}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Todos los partidos */}
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-[#1a1a2e]">
          Historial
        </h2>

        {partidos.length === 0 && (
          <div className="card-premium p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#d4af37]/10 to-[#b8860b]/5">
                <svg className="h-8 w-8 text-[#a67c2e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              </div>
            </div>
            <p className="font-medium text-[#1a1a2e]">No hay partidos registrados</p>
            <p className="mt-1 text-sm text-[#6b7280]">Los próximos partidos aparecerán acá</p>
          </div>
        )}

        {partidos.map((p) => {
          const stats = asistenciasPorPartido[p.id];
          return (
            <Link
              key={p.id}
              href={`/partido/${p.id}`}
              className="card-premium block p-4 transition-all active:scale-[0.98] hover:border-[#d4af37]/30"
            >
              <div className="flex items-center gap-4">
                {/* Indicador de estado */}
                <div className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                  p.estado === "finalizado"
                    ? "bg-[#0d9488]/10"
                    : p.estado === "jugando"
                    ? "bg-[#d4af37]/20"
                    : "bg-[#d4af37]/10"
                )}>
                  {p.estado === "finalizado" ? (
                    <svg className="h-6 w-6 text-[#0d9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-[#a67c2e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#1a1a2e] truncate">
                      {formatDateTime(p.fecha_hora)}
                    </p>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider",
                      p.estado === "finalizado"
                        ? "bg-[#0d9488]/10 text-[#0d9488]"
                        : p.estado === "jugando"
                        ? "bg-[#d4af37]/20 text-[#a67c2e] animate-pulse"
                        : "bg-[#d4af37]/10 text-[#a67c2e]"
                    )}>
                      {p.estado === "finalizado" ? "Finalizado" : p.estado === "jugando" ? "En vivo" : "Pendiente"}
                    </span>
                  </div>
                  <p className="text-sm text-[#6b7280] truncate">
                    {p.cancha?.nombre || "Sin cancha"}
                    {p.cancha?.direccion ? ` · ${p.cancha.direccion}` : ""}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {stats && (
                      <span className="text-xs text-[#6b7280]">
                        {stats.confirmados}/{stats.total} jugadores
                      </span>
                    )}
                  </div>
                </div>

                {/* Resultado / Indicador */}
                <div className="shrink-0 text-right">
                  {p.estado === "finalizado" && p.equipo_a_goles !== null && p.equipo_b_goles !== null ? (
                    <div className="font-extrabold text-lg text-[#1a1a2e]">
                      {p.equipo_a_goles} - {p.equipo_b_goles}
                    </div>
                  ) : (
                    <svg className="h-5 w-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
