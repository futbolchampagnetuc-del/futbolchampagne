import type {
  JugadorRow,
  PartidoRow,
  CanchaRow,
  AsistenciaRow,
  AsignacionEquipoRow,
  GolPartidoRow,
  EvaluacionRow,
  RankingRow,
} from "./database";

// Modelos extendidos con relaciones
export interface PartidoConCancha extends PartidoRow {
  cancha: CanchaRow;
}

export interface PartidoConAsistencia extends PartidoConCancha {
  asistentes: (AsistenciaRow & { jugador: JugadorRow })[];
  equipo_a: (AsignacionEquipoRow & { jugador: JugadorRow })[];
  equipo_b: (AsignacionEquipoRow & { jugador: JugadorRow })[];
  goles: (GolPartidoRow & { jugador: JugadorRow })[];
}

export interface JugadorConRating extends JugadorRow {
  promedio_estrellas: number;
  total_votos: number;
}

export interface JugadorConEstadisticas extends JugadorConRating {
  partidos_jugados: number;
  total_goles: number;
}

export interface EvaluacionConInfo extends EvaluacionRow {
  evaluador: JugadorRow;
  evaluado: JugadorRow;
}

export type SorteoResultado = {
  equipo_a: JugadorRow[];
  equipo_b: JugadorRow[];
  tipo: "random" | "balanceado";
};
