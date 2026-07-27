"use client";

import { useState, useRef, useEffect } from "react";
import { agregarComentario } from "@/actions/comentarios.actions";
import { AvatarWithName } from "@/components/shared/AvatarWithName";
import { formatTime } from "@/lib/utils";

type Comentario = {
  id: string;
  texto: string;
  created_at: string;
  jugador: {
    nombre_completo: string;
    foto_url: string | null;
  };
};

interface ComentariosPartidoProps {
  partidoId: string;
  comentariosIniciales: Comentario[];
  jugadorIdActual: string | null;
}

export function ComentariosPartido({ partidoId, comentariosIniciales, jugadorIdActual }: ComentariosPartidoProps) {
  const [comentarios, setComentarios] = useState<Comentario[]>(comentariosIniciales);
  const [texto, setTexto] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on load
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comentarios]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || !jugadorIdActual) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Optimistic update
      const nuevoComentario: Comentario = {
        id: "temp-" + Date.now(),
        texto: texto.trim(),
        created_at: new Date().toISOString(),
        jugador: {
          nombre_completo: "Tú", // Will be revalidated from server anyway
          foto_url: null,
        }
      };
      
      setComentarios((prev) => [...prev, nuevoComentario]);
      const tempTexto = texto;
      setTexto("");

      const res = await agregarComentario(partidoId, jugadorIdActual, tempTexto);
      
      if (!res.success) {
        setError(res.error || "Ocurrió un error al enviar");
        // Revert optimistic update
        setComentarios((prev) => prev.filter((c) => c.id !== nuevoComentario.id));
        setTexto(tempTexto);
      }
    } catch (err) {
      console.error(err);
      setError("Error de red");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card-premium overflow-hidden flex flex-col max-h-[500px]">
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a4a] px-4 py-3 flex items-center gap-2">
        <svg className="h-5 w-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
        </svg>
        <h3 className="font-bold text-white">La Tribuna</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fa] min-h-[200px]">
        {comentarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#6b7280]">
            <p className="text-sm">No hay comentarios aún.</p>
            <p className="text-xs mt-1">¡Sé el primero en agitarla!</p>
          </div>
        ) : (
          comentarios.map((c) => (
            <div key={c.id} className="flex gap-3 animate-fade-in">
              <div className="shrink-0 pt-1">
                <AvatarWithName name={c.jugador.nombre_completo} fotoUrl={c.jugador.foto_url} size="sm" hideName />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-[#1a1a2e] truncate">
                    {c.jugador.nombre_completo.split(" ")[0]}
                  </span>
                  <span className="text-[10px] text-[#9ca3af]">
                    {formatTime(c.created_at)}
                  </span>
                </div>
                <div className="mt-0.5 rounded-2xl rounded-tl-none bg-white px-3 py-2 text-sm text-[#374151] shadow-sm border border-gray-100">
                  {c.texto}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 bg-white border-t border-gray-100">
        {error && <p className="text-xs text-red-500 mb-2 px-1">{error}</p>}
        {jugadorIdActual ? (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribí un comentario..."
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={!texto.trim() || isSubmitting}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a1a2e] text-white disabled:opacity-50 hover:bg-[#d4af37] transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </form>
        ) : (
          <p className="text-xs text-center text-gray-500 py-1">
            Tenés que registrarte para poder comentar
          </p>
        )}
      </div>
    </div>
  );
}
