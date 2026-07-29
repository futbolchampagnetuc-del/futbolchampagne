"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight, Swords, Trophy, Frown } from "lucide-react";

interface MatchEntry {
  id: string;
  fecha_hora: string;
  equipo_a_nombre: string;
  equipo_b_nombre: string;
  equipo_a_goles: number | null;
  equipo_b_goles: number | null;
  miEquipo: "A" | "B";
  resultado: "ganado" | "perdido" | "empatado";
}

export function MatchHistory({ jugadorId }: { jugadorId: string }) {
  const [matches, setMatches] = useState<MatchEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/player-matches?jugadorId=${jugadorId}`);
        const data = await res.json();
        setMatches(data.matches || []);
      } catch {
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jugadorId]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8">
        <Swords className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Sin partidos jugados</p>
      </div>
    );
  }

  const ganados = matches.filter((m) => m.resultado === "ganado").length;
  const perdidos = matches.filter((m) => m.resultado === "perdido").length;
  const empatados = matches.filter((m) => m.resultado === "empatado").length;

  return (
    <div className="space-y-4">
      {/* Mini record */}
      <div className="flex items-center gap-4 text-xs font-semibold">
        <span className="flex items-center gap-1 text-emerald-400"><Trophy className="w-3.5 h-3.5" />{ganados}G</span>
        <span className="flex items-center gap-1 text-destructive"><Frown className="w-3.5 h-3.5" />{perdidos}P</span>
        <span className="flex items-center gap-1 text-muted-foreground">={empatados}E</span>
        <span className="text-muted-foreground ml-auto">{matches.length} partidos</span>
      </div>

      <div className="space-y-2">
        {matches.map((m, i) => {
          const isGanado = m.resultado === "ganado";
          const isPerdido = m.resultado === "perdido";
          const isEmpate = m.resultado === "empatado";
          return (
            <Link
              key={m.id}
              href={`/partido/${m.id}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all group"
            >
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                isGanado ? "bg-emerald-500/20 text-emerald-400" :
                isPerdido ? "bg-red-500/20 text-red-400" :
                "bg-muted text-muted-foreground"
              )}>
                {isGanado ? "G" : isPerdido ? "P" : "E"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">{new Date(m.fecha_hora).toLocaleDateString("es-AR")}</span>
                  <span className="text-[10px] text-muted-foreground">{m.miEquipo === "A" ? m.equipo_a_nombre : m.equipo_b_nombre}</span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  {m.equipo_a_nombre} {m.equipo_a_goles ?? "?"} : {m.equipo_b_goles ?? "?"} {m.equipo_b_nombre}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
