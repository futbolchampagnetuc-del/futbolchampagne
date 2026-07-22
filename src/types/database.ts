export interface Database {
  public: {
    Tables: {
      jugadores: {
        Row: JugadorRow;
        Insert: JugadorInsert;
        Update: JugadorUpdate;
      };
      canchas: {
        Row: CanchaRow;
        Insert: CanchaInsert;
        Update: CanchaUpdate;
      };
      partidos: {
        Row: PartidoRow;
        Insert: PartidoInsert;
        Update: PartidoUpdate;
      };
      asistencia: {
        Row: AsistenciaRow;
        Insert: AsistenciaInsert;
        Update: AsistenciaUpdate;
      };
      asignacion_equipos: {
        Row: AsignacionEquipoRow;
        Insert: AsignacionEquipoInsert;
        Update: AsignacionEquipoUpdate;
      };
      goles_partido: {
        Row: GolPartidoRow;
        Insert: GolPartidoInsert;
        Update: GolPartidoUpdate;
      };
      evaluaciones: {
        Row: EvaluacionRow;
        Insert: EvaluacionInsert;
        Update: EvaluacionUpdate;
      };
    };
    Views: {
      rankings: {
        Row: RankingRow;
      };
    };
  };
}

// Jugadores
export interface JugadorRow {
  id: string;
  nombre_completo: string;
  email: string;
  foto_url: string | null;
  altura: number | null;
  peso: number | null;
  edad: number | null;
  pie_habil: "izquierdo" | "derecho" | "ambidiestro" | null;
  numero_dorsal: number | null;
  equipo_favorito: string | null;
  caracteristica_juego: string | null;
  escudo_equipo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface JugadorInsert {
  id: string;
  nombre_completo: string;
  email: string;
  foto_url?: string | null;
  altura?: number | null;
  peso?: number | null;
  edad?: number | null;
  pie_habil?: "izquierdo" | "derecho" | "ambidiestro" | null;
  numero_dorsal?: number | null;
  equipo_favorito?: string | null;
  caracteristica_juego?: string | null;
  escudo_equipo_url?: string | null;
}

export interface JugadorUpdate {
  nombre_completo?: string;
  foto_url?: string | null;
  altura?: number | null;
  peso?: number | null;
  edad?: number | null;
  pie_habil?: "izquierdo" | "derecho" | "ambidiestro" | null;
  numero_dorsal?: number | null;
  equipo_favorito?: string | null;
  caracteristica_juego?: string | null;
  escudo_equipo_url?: string | null;
}

// Canchas
export interface CanchaRow {
  id: string;
  nombre: string;
  direccion: string;
  coordenadas: string | null;
  telefono_contacto: string | null;
  activa: boolean;
  created_at: string;
}

export interface CanchaInsert {
  nombre: string;
  direccion: string;
  coordenadas?: string | null;
  telefono_contacto?: string | null;
  activa?: boolean;
}

export interface CanchaUpdate {
  nombre?: string;
  direccion?: string;
  coordenadas?: string | null;
  telefono_contacto?: string | null;
  activa?: boolean;
}

// Partidos
export type PartidoEstado = "pendiente" | "jugando" | "finalizado" | "cancelado";

export interface PartidoRow {
  id: string;
  fecha_hora: string;
  cancha_id: string;
  estado: PartidoEstado;
  equipo_a_nombre: string;
  equipo_b_nombre: string;
  equipo_a_goles: number | null;
  equipo_b_goles: number | null;
  created_at: string;
}

export interface PartidoInsert {
  fecha_hora: string;
  cancha_id: string;
  estado?: PartidoEstado;
  equipo_a_nombre?: string;
  equipo_b_nombre?: string;
  equipo_a_goles?: number | null;
  equipo_b_goles?: number | null;
}

export interface PartidoUpdate {
  fecha_hora?: string;
  cancha_id?: string;
  estado?: PartidoEstado;
  equipo_a_nombre?: string;
  equipo_b_nombre?: string;
  equipo_a_goles?: number | null;
  equipo_b_goles?: number | null;
}

// Asistencia
export interface AsistenciaRow {
  id: string;
  partido_id: string;
  jugador_id: string;
  confirmado: boolean;
  fecha_confirmacion: string;
}

export interface AsistenciaInsert {
  partido_id: string;
  jugador_id: string;
  confirmado?: boolean;
  fecha_confirmacion?: string;
}

export interface AsistenciaUpdate {
  confirmado?: boolean;
  fecha_confirmacion?: string;
}

// Asignación de equipos
export type EquipoTipo = "A" | "B";
export type SorteoTipo = "random" | "balanceado";

export interface AsignacionEquipoRow {
  id: string;
  partido_id: string;
  jugador_id: string;
  equipo: EquipoTipo;
  tipo_sorteo: SorteoTipo;
  created_at: string;
}

export interface AsignacionEquipoInsert {
  partido_id: string;
  jugador_id: string;
  equipo: EquipoTipo;
  tipo_sorteo: SorteoTipo;
}

export interface AsignacionEquipoUpdate {
  equipo?: EquipoTipo;
}

// Goles
export interface GolPartidoRow {
  id: string;
  partido_id: string;
  jugador_id: string;
  cantidad_goles: number;
  created_at: string;
}

export interface GolPartidoInsert {
  partido_id: string;
  jugador_id: string;
  cantidad_goles?: number;
}

export interface GolPartidoUpdate {
  cantidad_goles?: number;
}

// Evaluaciones
export interface EvaluacionRow {
  id: string;
  partido_id: string;
  evaluador_id: string;
  evaluado_id: string;
  estrellas: number;
  comentario: string | null;
  created_at: string;
}

export interface EvaluacionInsert {
  partido_id: string;
  evaluador_id: string;
  evaluado_id: string;
  estrellas: number;
  comentario?: string | null;
}

export interface EvaluacionUpdate {
  estrellas?: number;
  comentario?: string | null;
}

// Rankings (vista materializada)
export interface RankingRow {
  jugador_id: string;
  nombre_completo: string;
  foto_url: string | null;
  partidos_jugados: number;
  partidos_ganados: number;
  partidos_perdidos: number;
  partidos_empatados: number;
  total_goles: number;
  promedio_estrellas: number;
  total_votos_recibidos: number;
  updated_at: string;
}
