"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { realizarSorteo, guardarSorteoManual } from "@/actions/sorteo.actions";
import { AvatarWithName } from "@/components/shared/AvatarWithName";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface JugadorSorteo {
  id: string;
  nombre_completo: string;
  foto_url: string | null;
  edad: number | null;
  altura: number | null;
  peso: number | null;
  globalRating: number;
}

interface SorteoClientProps {
  partidoId: string;
  asistentes: JugadorSorteo[];
  asignacionActual: { jugador_id: string; equipo: string }[];
}

type SorteoMode = "random" | "balanceado" | "manual";

export function SorteoClient({
  partidoId,
  asistentes,
  asignacionActual,
}: SorteoClientProps) {
  const router = useRouter();
  const [mode, setMode] = useState<SorteoMode>("random");
  
  const [sinEquipo, setSinEquipo] = useState<JugadorSorteo[]>([]);
  const [equipoA, setEquipoA] = useState<JugadorSorteo[]>([]);
  const [equipoB, setEquipoB] = useState<JugadorSorteo[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize state based on current assignment or move all to 'sinEquipo'
  useEffect(() => {
    if (asignacionActual.length > 0) {
      const a: JugadorSorteo[] = [];
      const b: JugadorSorteo[] = [];
      const un: JugadorSorteo[] = [];
      
      asistentes.forEach(jug => {
        const asig = asignacionActual.find(x => x.jugador_id === jug.id);
        if (asig?.equipo === "A") a.push(jug);
        else if (asig?.equipo === "B") b.push(jug);
        else un.push(jug);
      });
      
      setEquipoA(a);
      setEquipoB(b);
      setSinEquipo(un);
      setMode("manual");
    } else {
      setSinEquipo(asistentes);
      setEquipoA([]);
      setEquipoB([]);
    }
  }, [asistentes, asignacionActual]);

  const handleDragEnd = (result: DropResult) => {
    if (mode !== "manual") return;
    if (!result.destination) return;

    const sourceId = result.source.droppableId;
    const destId = result.destination.droppableId;
    
    if (sourceId === destId && result.source.index === result.destination.index) return;

    const getList = (id: string) => {
      if (id === "sinEquipo") return sinEquipo;
      if (id === "equipoA") return equipoA;
      return equipoB;
    };
    
    const setList = (id: string, list: JugadorSorteo[]) => {
      if (id === "sinEquipo") setSinEquipo(list);
      else if (id === "equipoA") setEquipoA(list);
      else setEquipoB(list);
    };

    const sourceList = Array.from(getList(sourceId));
    const destList = Array.from(getList(destId));
    
    const [movedItem] = sourceList.splice(result.source.index, 1);
    
    if (sourceId === destId) {
      sourceList.splice(result.destination.index, 0, movedItem);
      setList(sourceId, sourceList);
    } else {
      destList.splice(result.destination.index, 0, movedItem);
      setList(sourceId, sourceList);
      setList(destId, destList);
    }
  };

  const handleSortearAuto = async (tipo: "random" | "balanceado") => {
    setLoading(true);
    setError(null);
    try {
      const result = await realizarSorteo(partidoId, tipo);
      // Actualizar listas con los resultados. `result.equipoA` sólo trae los perfiles básicos.
      // Re-mapeamos desde `asistentes` para retener `edad, altura, peso, etc.`
      const a = result.equipoA.map((res: any) => asistentes.find(j => j.id === res.id)!);
      const b = result.equipoB.map((res: any) => asistentes.find(j => j.id === res.id)!);
      
      setEquipoA(a);
      setEquipoB(b);
      setSinEquipo([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al sortear");
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarManual = async () => {
    setLoading(true);
    setError(null);
    try {
      await guardarSorteoManual(
        partidoId, 
        equipoA.map(j => j.id), 
        equipoB.map(j => j.id)
      );
      router.refresh();
      alert("Equipos guardados correctamente");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (equipo: JugadorSorteo[]) => {
    if (equipo.length === 0) return null;
    
    let sumEdad = 0; let countEdad = 0;
    let sumAltura = 0; let countAltura = 0;
    let sumPeso = 0; let countPeso = 0;
    let sumRating = 0; let countRating = 0;

    equipo.forEach(j => {
      if (j.edad) { sumEdad += j.edad; countEdad++; }
      if (j.altura) { sumAltura += j.altura; countAltura++; }
      if (j.peso) { sumPeso += j.peso; countPeso++; }
      if (j.globalRating) { sumRating += j.globalRating; countRating++; }
    });

    return {
      edad: countEdad > 0 ? (sumEdad / countEdad).toFixed(1) : "-",
      altura: countAltura > 0 ? (sumAltura / countAltura).toFixed(0) : "-",
      peso: countPeso > 0 ? (sumPeso / countPeso).toFixed(1) : "-",
      rating: countRating > 0 ? (sumRating / countRating).toFixed(1) : "-"
    };
  };

  const statsA = calculateStats(equipoA);
  const statsB = calculateStats(equipoB);

  // Render para los items draggable
  const renderDraggableItem = (jugador: JugadorSorteo, index: number, colorPrefix: string) => (
    <Draggable key={jugador.id} draggableId={jugador.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "rounded-lg bg-card/90 backdrop-blur-sm px-3 py-2 border mb-2 select-none",
            snapshot.isDragging ? "shadow-lg scale-105 z-50 border-blue-400" : `border-[${colorPrefix}]/10 shadow-sm`
          )}
          style={{ ...provided.draggableProps.style }}
        >
          <div className="flex items-center justify-between">
            <AvatarWithName name={jugador.nombre_completo} fotoUrl={jugador.foto_url} size="sm" />
            <div className="flex gap-2 text-[10px] text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md">
              {jugador.globalRating > 0 && <span title="Habilidad">⭐ {jugador.globalRating.toFixed(1)}</span>}
              {jugador.altura && <span title="Altura">📏 {jugador.altura}cm</span>}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="card-premium p-1">
        <div className="flex rounded-xl bg-muted p-1 flex-wrap md:flex-nowrap">
          <button
            onClick={() => setMode("random")}
            className={cn("flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all", mode === "random" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
          >
            🎲 Random
          </button>
          <button
            onClick={() => setMode("balanceado")}
            className={cn("flex-1 rounded-lg px-3 sm:px-4 py-2.5 text-[11px] sm:text-sm font-semibold transition-all", mode === "balanceado" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
          >
            ⚖️ Balanceado
          </button>
          <button
            onClick={() => setMode("manual")}
            className={cn("flex-1 rounded-lg px-3 sm:px-4 py-2.5 text-[11px] sm:text-sm font-semibold transition-all", mode === "manual" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
          >
            🖐️ Manual
          </button>
        </div>
      </div>

      <div className="text-center">
        <span className="badge-champagne text-sm px-4 py-1.5">
          {asistentes.length} jugadores confirmados
        </span>
      </div>

      {mode !== "manual" && (
        <button onClick={() => handleSortearAuto(mode)} disabled={loading} className="btn-primary w-full text-base py-4">
          {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "¡Sortear Automáticamente!"}
        </button>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-sm text-red-700 animate-scale-in">
          {error}
        </div>
      )}

      {mode === "manual" ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="space-y-4">
            {sinEquipo.length > 0 && (
              <div className="card-premium p-4 border border-dashed border-[#d4af37]/50">
                <h3 className="font-semibold text-center mb-3 text-muted-foreground">Disponibles ({sinEquipo.length})</h3>
                <Droppable droppableId="sinEquipo">
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                      className={cn("min-h-[60px] p-2 rounded-xl transition-colors", snapshot.isDraggingOver ? "bg-[#d4af37]/10" : "")}
                    >
                      {sinEquipo.map((j, i) => renderDraggableItem(j, i, "#d4af37"))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Equipo A */}
              <div className="card-gold overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-[#d4af37]/20 to-[#b8860b]/10 px-4 py-3">
                  <h3 className="text-center font-bold text-[#a67c2e]">🇦 Equipo A ({equipoA.length})</h3>
                  {statsA && (
                    <div className="flex justify-center gap-3 mt-2 text-[11px] font-medium text-[#d4af37] bg-card/60 px-2 py-1 rounded-md">
                      <span>⭐ {statsA.rating}</span>
                      <span>📏 {statsA.altura}cm</span>
                      <span>⚖️ {statsA.peso}kg</span>
                      <span>🎂 {statsA.edad}</span>
                    </div>
                  )}
                </div>
                <Droppable droppableId="equipoA">
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                      className={cn("p-3 flex-1 min-h-[150px] transition-colors", snapshot.isDraggingOver ? "bg-[#d4af37]/10" : "bg-muted/30")}
                    >
                      {equipoA.map((j, i) => renderDraggableItem(j, i, "#d4af37"))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>

              {/* Equipo B */}
              <div className="card-premium overflow-hidden flex flex-col border-[#0d9488]/30">
                <div className="bg-gradient-to-r from-[#0d9488]/10 to-[#0f766e]/10 px-4 py-3">
                  <h3 className="text-center font-bold text-[#0d9488]">🇧 Equipo B ({equipoB.length})</h3>
                  {statsB && (
                    <div className="flex justify-center gap-3 mt-2 text-[11px] font-medium text-emerald-400 bg-card/60 px-2 py-1 rounded-md">
                      <span>⭐ {statsB.rating}</span>
                      <span>📏 {statsB.altura}cm</span>
                      <span>⚖️ {statsB.peso}kg</span>
                      <span>🎂 {statsB.edad}</span>
                    </div>
                  )}
                </div>
                <Droppable droppableId="equipoB">
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                      className={cn("p-3 flex-1 min-h-[150px] transition-colors", snapshot.isDraggingOver ? "bg-[#0d9488]/10" : "bg-muted/20")}
                    >
                      {equipoB.map((j, i) => renderDraggableItem(j, i, "#0d9488"))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
            
            <button onClick={handleGuardarManual} disabled={loading} className="btn-primary w-full text-base py-4 mt-6">
              {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "💾 Guardar Equipos"}
            </button>
          </div>
        </DragDropContext>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up mt-6">
          {(equipoA.length > 0 || equipoB.length > 0) && (
            <>
              {/* Vista Sólo Lectura de Equipos para Automático */}
              <div className="card-gold overflow-hidden">
                <div className="bg-gradient-to-r from-[#d4af37]/20 to-[#b8860b]/10 px-4 py-3">
                    <h3 className="text-center font-bold text-[#d4af37]">🇦 Equipo A ({equipoA.length})</h3>
                    {statsA && (
                      <div className="flex justify-center gap-3 mt-2 text-[11px] font-medium text-[#d4af37] bg-card/60 px-2 py-1 rounded-md">
                      <span>⭐ {statsA.rating}</span> |
                      <span>📏 {statsA.altura}cm</span>
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-1.5">
                  {equipoA.map((j) => (
                    <div key={j.id} className="rounded-lg bg-card/80 backdrop-blur-sm px-3 py-2 border border-[#d4af37]/10 flex justify-between items-center">
                      <AvatarWithName name={j.nombre_completo} fotoUrl={j.foto_url} size="sm" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-premium overflow-hidden border-[#0d9488]/30">
                <div className="bg-gradient-to-r from-[#0d9488]/10 to-[#0f766e]/10 px-4 py-3">
                    <h3 className="text-center font-bold text-emerald-400">🇧 Equipo B ({equipoB.length})</h3>
                    {statsB && (
                      <div className="flex justify-center gap-3 mt-2 text-[11px] font-medium text-emerald-400 bg-card/60 px-2 py-1 rounded-md">
                      <span>⭐ {statsB.rating}</span> |
                      <span>📏 {statsB.altura}cm</span>
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-1.5">
                  {equipoB.map((j) => (
                    <div key={j.id} className="rounded-lg bg-card/80 backdrop-blur-sm px-3 py-2 border border-[#0d9488]/10 flex justify-between items-center">
                      <AvatarWithName name={j.nombre_completo} fotoUrl={j.foto_url} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
