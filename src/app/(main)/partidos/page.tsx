import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDateTime, cn } from "@/lib/utils";
import { Calendar, MapPin, ChevronRight, CheckCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PartidosPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  const partidosPendientes = partidos.filter((p) => p.estado === "pendiente" || p.estado === "programado");
  const partidosFinalizados = partidos.filter((p) => p.estado === "finalizado");

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Partidos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {partidos.length} partidos &bull; {partidosFinalizados.length} finalizados
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-[#d4af37]" />
        </div>
      </div>

      {partidosPendientes.length > 0 && (
        <div className="card-dark rounded-2xl overflow-hidden border-l-4 border-l-[#d4af37]">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-[#d4af37] animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#d4af37]">
                Próximo Partido
              </span>
            </div>
            {partidosPendientes.slice(0, 1).map((p) => (
              <Link key={p.id} href={`/partido/${p.id}`} className="block group">
                <p className="font-bold text-foreground group-hover:text-[#d4af37] transition-colors">
                  {formatDateTime(p.fecha_hora)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {p.cancha?.nombre}{p.cancha?.direccion ? ` · ${p.cancha.direccion}` : ""}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Historial</h2>

        {partidos.length === 0 && (
          <div className="card-dark rounded-2xl p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-[#d4af37]/60" />
              </div>
            </div>
            <p className="font-semibold text-foreground">No hay partidos registrados</p>
            <p className="mt-1 text-sm text-muted-foreground">Los próximos partidos aparecerán acá</p>
          </div>
        )}

        {partidos.map((p) => {
          const stats = asistenciasPorPartido[p.id];
          const isFinalizado = p.estado === "finalizado";
          return (
            <Link
              key={p.id}
              href={`/partido/${p.id}`}
              className="card-dark rounded-2xl block p-4 transition-all hover:border-[#d4af37]/30 active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 shrink-0 rounded-xl flex items-center justify-center",
                  isFinalizado ? "bg-emerald-500/10" : "bg-[#d4af37]/10"
                )}>
                  {isFinalizado ? (
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Clock className="w-6 h-6 text-[#d4af37]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-foreground truncate">{formatDateTime(p.fecha_hora)}</p>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider shrink-0",
                      isFinalizado
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-[#d4af37]/10 text-[#d4af37]"
                    )}>
                      {isFinalizado ? "Finalizado" : "Pendiente"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {p.cancha?.nombre || "Sin cancha"}
                    {p.cancha?.direccion ? ` · ${p.cancha.direccion}` : ""}
                  </p>
                  {stats && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stats.confirmados}/{stats.total} jugadores
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  {isFinalizado && p.equipo_a_goles !== null && p.equipo_b_goles !== null ? (
                    <div className="font-black text-lg text-foreground">
                      {p.equipo_a_goles} - {p.equipo_b_goles}
                    </div>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground/40" />
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
