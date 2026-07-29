"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatTime } from "@/lib/utils";
import { MessageSquare, Send, User } from "lucide-react";

type Comentario = {
  id: string;
  texto: string;
  created_at: string;
  autor_nombre: string;
};

interface ComentariosPartidoProps {
  partidoId: string;
  comentariosIniciales: Comentario[];
  estadoPartido: string;
}

export function ComentariosPartido({ partidoId, comentariosIniciales, estadoPartido }: ComentariosPartidoProps) {
  const [comentarios, setComentarios] = useState<Comentario[]>(comentariosIniciales);
  const [texto, setTexto] = useState("");
  const [nombre, setNombre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comentarios.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || !nombre.trim()) return;

    setIsSubmitting(true);
    setError("");

    const textoFinal = texto.trim();
    const nombreFinal = nombre.trim();

    const optimisticId = "temp-" + Date.now();
    setComentarios((prev) => [...prev, {
      id: optimisticId,
      texto: textoFinal,
      created_at: new Date().toISOString(),
      autor_nombre: nombreFinal,
    }]);
    setTexto("");

    try {
      const { error: dbError } = await createClient()
        .from("comentarios_partido")
        .insert({
          partido_id: partidoId,
          autor_nombre: nombreFinal,
          texto: textoFinal,
          jugador_id: null,
        });

      if (dbError) {
        setError(dbError.message);
        setComentarios((prev) => prev.filter((c) => c.id !== optimisticId));
      }
    } catch (err: any) {
      setError(err?.message || "Error al enviar comentario");
      setComentarios((prev) => prev.filter((c) => c.id !== optimisticId));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card-dark rounded-2xl overflow-hidden flex flex-col max-h-[500px]">
      <div className="bg-gradient-to-r from-[#d4af37]/20 to-[#b8860b]/10 px-4 py-3 flex items-center gap-2 border-b border-border">
        <MessageSquare className="h-5 w-5 text-[#d4af37]" />
        <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">La Tribuna</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30 min-h-[200px]">
        {comentarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">No hay comentarios aún.</p>
            <p className="text-xs mt-1">¡Sé el primero en agitarla!</p>
          </div>
        ) : (
          comentarios.map((c) => (
            <div key={c.id} className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-[#d4af37]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-foreground truncate">
                    {c.autor_nombre}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatTime(c.created_at)}
                  </span>
                </div>
                <div className="mt-0.5 rounded-2xl rounded-tl-none bg-card px-3 py-2 text-sm text-card-foreground border border-border/50 break-words whitespace-pre-wrap">
                  {c.texto}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-border bg-card">
        {error && <p className="text-xs text-destructive mb-2 px-1">{error}</p>}
        {estadoPartido !== "finalizado" ? (
          <p className="text-xs text-center text-muted-foreground py-1">
            Los comentarios se habilitan cuando finaliza el partido. ¡El Tercer Tiempo!
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre (ej. Juan)"
              className="w-full rounded-xl bg-muted border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 transition-all"
              disabled={isSubmitting}
              maxLength={30}
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escribí un comentario..."
                className="flex-1 rounded-full bg-muted border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 transition-all"
                disabled={isSubmitting || !nombre.trim()}
                maxLength={200}
              />
              <button
                type="submit"
                disabled={!texto.trim() || !nombre.trim() || isSubmitting}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d4af37] text-black disabled:opacity-40 hover:bg-[#f0d060] transition-all active:scale-95"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
