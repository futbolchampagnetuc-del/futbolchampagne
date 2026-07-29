"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, User } from "lucide-react";

interface ReviewEntry {
  partido_id: string;
  partido_fecha: string;
  evaluador_nombre: string;
  estrellas: number;
  comentario: string | null;
  premio: string | null;
}

export function PlayerReviews({ jugadorId }: { jugadorId: string }) {
  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/player-reviews?jugadorId=${jugadorId}`);
        const data = await res.json();
        setReviews(data.reviews || []);
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jugadorId]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Sin reseñas todavía</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((r, i) => (
        <div key={i} className="p-3.5 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
                <User className="w-3 h-3 text-[#d4af37]" />
              </div>
              <span className="text-xs font-semibold text-foreground">{r.evaluador_nombre}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-foreground">{r.estrellas}</span>
              <Star className="w-3 h-3 fill-[#d4af37] text-[#d4af37]" />
            </div>
          </div>
          {r.comentario && (
            <p className="text-xs text-muted-foreground leading-relaxed ml-8">{r.comentario}</p>
          )}
          {r.premio && (
            <div className="ml-8 mt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded-full">
                {r.premio}
              </span>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground/60 mt-1.5 ml-8">
            {new Date(r.partido_fecha).toLocaleDateString("es-AR")}
          </p>
        </div>
      ))}
    </div>
  );
}
