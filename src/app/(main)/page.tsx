import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate, formatTime, cn } from "@/lib/utils";
import { ComentariosPartido } from "@/components/features/partido/ComentariosPartido";
import { Calendar, MapPin, ChevronRight, Goal, Trophy, Star, Users, Footprints } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    let jugadorIdActual = null;
    if (user && user.email) {
      const { data: userData } = await supabase
        .from("jugadores")
        .select("id")
        .eq("email", user.email)
        .single();
      if (userData) {
        jugadorIdActual = userData.id;
      }
    }

    // Último partido finalizado
    const { data: ultimoPartidoRaw } = await supabase
      .from("partidos")
      .select("*, cancha:canchas(*)")
      .eq("estado", "finalizado")
      .order("fecha_hora", { ascending: false })
      .limit(1);

    const ultimoPartido = ultimoPartidoRaw && ultimoPartidoRaw.length > 0
      ? ultimoPartidoRaw[0] as unknown as {
          id: string; fecha_hora: string; estado: string;
          equipo_a_nombre: string; equipo_b_nombre: string;
          equipo_a_goles: number | null; equipo_b_goles: number | null;
          cancha: { nombre: string; direccion: string } | null;
        }
      : null;

    // Próximo partido
    const { data: partidosList } = await supabase
      .from("partidos")
      .select("*, cancha:canchas(*)")
      .in("estado", ["programado", "jugando"])
      .gte("fecha_hora", new Date().toISOString())
      .order("fecha_hora", { ascending: true })
      .limit(1);

    const proximoPartido = partidosList && partidosList.length > 0
      ? partidosList[0] as unknown as {
          id: string; fecha_hora: string; estado: string;
          cancha: { nombre: string; direccion: string } | null;
        }
      : null;

    // Data del último partido
    let equipoA: any[] = [];
    let equipoB: any[] = [];
    let golesData: Record<string, number> = {};
    let goleadores: { nombre: string; goles: number }[] = [];
    let evaluacionesResumen: { nombre: string; estrellas: number; premio: string | null }[] = [];
    let mejorJugador: { nombre: string; estrellas: number } | null = null;
    let mvp: string | null = null;
    let comentariosIniciales: any[] = [];

    if (ultimoPartido) {
      // Equipos
      const { data: asig } = await supabase
        .from("asignacion_equipos")
        .select("equipo, jugador:jugadores(nombre_completo, foto_url)")
        .eq("partido_id", ultimoPartido.id);
      const asignaciones = (asig || []) as any[];
      equipoA = asignaciones.filter((a: any) => a.equipo === "A");
      equipoB = asignaciones.filter((a: any) => a.equipo === "B");

      // Goles
      const { data: goles } = await supabase
        .from("goles_partido")
        .select("cantidad_goles, jugador:jugadores(nombre_completo)")
        .eq("partido_id", ultimoPartido.id);
      if (goles) {
        golesData = goles.reduce((acc: any, g: any) => {
          acc[g.jugador.nombre_completo] = (acc[g.jugador.nombre_completo] || 0) + g.cantidad_goles;
          return acc;
        }, {});
        goleadores = Object.entries(golesData)
          .map(([nombre, goles]) => ({ nombre, goles: goles as number }))
          .sort((a, b) => b.goles - a.goles);
      }

      // Evaluaciones
      const { data: evals } = await supabase
        .from("evaluaciones")
        .select("estrellas, premio, evaluado:jugadores!evaluaciones_evaluado_id_fkey(nombre_completo)")
        .eq("partido_id", ultimoPartido.id);

      if (evals) {
        const evalMap = new Map<string, { total: number; count: number; premio: string | null }>();
        for (const e of evals as any[]) {
          const name = e.evaluado?.nombre_completo;
          if (!name) continue;
          if (!evalMap.has(name)) evalMap.set(name, { total: 0, count: 0, premio: null });
          const entry = evalMap.get(name)!;
          entry.total += e.estrellas;
          entry.count += 1;
          if (e.premio === "MVP") entry.premio = "MVP";
        }

        for (const [nombre, data] of evalMap) {
          evaluacionesResumen.push({
            nombre,
            estrellas: parseFloat((data.total / data.count).toFixed(1)),
            premio: data.premio,
          });
          if (data.premio === "MVP") mvp = nombre;
        }
        evaluacionesResumen.sort((a, b) => b.estrellas - a.estrellas);
        if (evaluacionesResumen.length > 0) {
          mejorJugador = { nombre: evaluacionesResumen[0].nombre, estrellas: evaluacionesResumen[0].estrellas };
        }
      }

      // Comentarios
      const { data: comentariosRaw } = await supabase
        .from("comentarios_partido")
        .select("*, jugador:jugadores(nombre_completo, foto_url)")
        .eq("partido_id", ultimoPartido.id)
        .order("created_at", { ascending: true });
      comentariosIniciales = (comentariosRaw || []) as any[];
    }

    const hayData = ultimoPartido || proximoPartido;

    return (
      <div className="space-y-5 animate-fade-in pb-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl card-pitch p-6 pt-8">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L35 20 L50 20 L38 30 L42 45 L30 36 L18 45 L22 30 L10 20 L25 20 Z' fill='white' opacity='0.3'/%3E%3C/svg%3E\")",
            backgroundSize: "40px 40px",
          }} />
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
              <Footprints className="w-4 h-4 text-[#d4af37]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/80">Fútbol Champagne</span>
            </div>
            <h1 className="text-3xl font-black text-white leading-tight">
              {ultimoPartido ? "Último Partido" : proximoPartido ? "Próximo Partido" : "Bienvenido"}
            </h1>
            <p className="mt-2 text-sm text-white/70 max-w-xs mx-auto">
              {ultimoPartido
                ? "Reviví lo que pasó en la cancha"
                : proximoPartido
                ? "Preparate para el próximo encuentro"
                : "Armá tu equipo y salí a jugar"}
            </p>
          </div>
        </div>

        {!hayData ? (
          <div className="flex flex-col items-center py-12">
            <div className="w-20 h-20 rounded-full bg-[#d4af37]/10 flex items-center justify-center mb-5">
              <Footprints className="w-10 h-10 text-[#d4af37]/60" />
            </div>
            <h2 className="text-xl font-bold text-foreground">No hay partidos todavía</h2>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-xs">
              Creá un partido desde el panel de admin para empezar
            </p>
          </div>
        ) : (
          <>
            {/* ÚLTIMO PARTIDO - Resultados */}
            {ultimoPartido && (
              <div className="animate-slide-up">
                {/* Scoreboard */}
                <div className="card-dark rounded-2xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-blue-500 via-[#d4af37] to-red-500" />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {formatDate(ultimoPartido.fecha_hora)}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatTime(ultimoPartido.fecha_hora)}</span>
                    </div>

                    {/* Marcador */}
                    <div className="flex items-center justify-center gap-6 py-4">
                      <div className="flex-1 text-right">
                        <p className="text-lg font-bold text-blue-400 truncate">{ultimoPartido.equipo_a_nombre || "Equipo A"}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-5xl font-black text-foreground">{ultimoPartido.equipo_a_goles ?? 0}</span>
                        <span className="text-xl font-bold text-muted-foreground">:</span>
                        <span className="text-5xl font-black text-foreground">{ultimoPartido.equipo_b_goles ?? 0}</span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-lg font-bold text-red-400 truncate">{ultimoPartido.equipo_b_nombre || "Equipo B"}</p>
                      </div>
                    </div>

                    {/* Info cancha */}
                    {ultimoPartido.cancha && (
                      <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ultimoPartido.cancha.nombre}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Goleadores */}
                {goleadores.length > 0 && (
                  <div className="card-dark rounded-2xl p-5 mt-4">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
                      <Goal className="w-4 h-4 text-[#d4af37]" />
                      Goleadores
                    </h3>
                    <div className="space-y-2">
                      {goleadores.map((g, i) => (
                        <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl bg-muted/50">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] text-[10px] font-bold flex items-center justify-center">
                              {i + 1}
                            </span>
                            <span className="text-sm font-medium text-foreground">{g.nombre}</span>
                          </div>
                          <span className="text-lg font-black text-[#d4af37]">{g.goles}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mejor valorado */}
                {mejorJugador && (
                  <div className="card-dark rounded-2xl p-5 mt-4">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
                      <Star className="w-4 h-4 text-[#d4af37]" />
                      Valoraciones
                    </h3>
                    <div className="space-y-2">
                      {evaluacionesResumen.slice(0, 5).map((e, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground">{e.nombre}</span>
                            {e.premio === "MVP" && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded-full">
                                MVP
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-foreground">{e.estrellas}</span>
                            <Star className="w-3.5 h-3.5 fill-[#d4af37] text-[#d4af37]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Link al detalle */}
                <Link
                  href={`/partido/${ultimoPartido.id}`}
                  className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/30 border border-border mt-4 hover:bg-muted/50 transition-colors group"
                >
                  <span className="text-sm font-medium text-foreground">Ver detalle completo del partido</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>

                {/* Tribuna - Comentarios */}
                <div className="mt-6">
                  <ComentariosPartido
                    partidoId={ultimoPartido.id}
                    comentariosIniciales={comentariosIniciales}
                    estadoPartido={ultimoPartido.estado}
                  />
                </div>
              </div>
            )}

            {/* PRÓXIMO PARTIDO */}
            {proximoPartido && (
              <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-[#d4af37]" />
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Próximo Partido</h2>
                </div>
                <Link
                  href={`/partido/${proximoPartido.id}`}
                  className="card-dark rounded-2xl p-5 flex items-center justify-between group hover:border-[#d4af37]/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-[#d4af37]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{formatDate(proximoPartido.fecha_hora)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(proximoPartido.fecha_hora)}
                        {proximoPartido.cancha && ` · ${proximoPartido.cancha.nombre}`}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    );
  } catch (error: any) {
    return (
      <div className="flex flex-col items-center justify-center pt-16 pb-12 px-4 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
          <span className="text-4xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold text-destructive mb-2">Error de Conexión</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Ocurrió un error al conectar con la base de datos.
        </p>
      </div>
    );
  }
}
