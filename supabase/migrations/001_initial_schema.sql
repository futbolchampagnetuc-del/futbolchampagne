-- ============================================
-- FutbolChampagne — Migración Inicial (Open System)
-- ============================================

-- 1. CREAR EXTENSIONES
create extension if not exists "pgcrypto";

-- 2. ENUMS
create type user_role as enum ('admin', 'jugador');
create type partido_estado as enum ('programado', 'jugando', 'finalizado', 'suspendido');
create type asistencia_estado as enum ('asisto', 'no asisto', 'tal_vez', 'pendiente');

-- 3. TABLA: configuracion
create table if not exists configuracion (
  id integer primary key default 1 check (id = 1),
  nombre_torneo text not null default 'FutbolChampagne',
  colores jsonb,
  logo_url text,
  max_jugadores_default integer default 10,
  duracion_partido_minutos integer default 60,
  sistema_puntuacion text default 'clasico',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. TABLA: jugadores
create table if not exists jugadores (
  id uuid primary key default gen_random_uuid(),
  rol user_role not null default 'jugador',
  nombre_completo text not null,
  email text not null,
  foto_url text,
  fecha_nacimiento date,
  altura integer, -- en cm
  peso numeric(5,1), -- en kg
  posiciones text[], -- ej: ['Arquero', 'Defensor']
  pie_habil text[], -- ej: ['Derecho', 'Izquierdo'] o ['Ambos']
  numero_dorsal integer,
  equipo_favorito text,
  caracteristica_juego text,
  talle_camiseta text, -- ej: S, M, L, XL, XXL
  escudo_equipo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger para actualizar updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_jugadores_updated_at
  before update on jugadores
  for each row execute function update_updated_at();
create trigger trg_config_updated_at
  before update on configuracion
  for each row execute function update_updated_at();

-- 5. TABLA: jugador_habilidades
create table if not exists jugador_habilidades (
  jugador_id uuid primary key references jugadores(id) on delete cascade,
  velocidad integer check (velocidad between 1 and 5) default 3,
  resistencia integer check (resistencia between 1 and 5) default 3,
  fuerza integer check (fuerza between 1 and 5) default 3,
  quite integer check (quite between 1 and 5) default 3,
  marcacion integer check (marcacion between 1 and 5) default 3,
  pase integer check (pase between 1 and 5) default 3,
  vision integer check (vision between 1 and 5) default 3,
  pegada integer check (pegada between 1 and 5) default 3,
  definicion integer check (definicion between 1 and 5) default 3,
  cabezazo integer check (cabezazo between 1 and 5) default 3,
  juego_aereo integer check (juego_aereo between 1 and 5) default 3,
  liderazgo integer check (liderazgo between 1 and 5) default 3,
  compromiso integer check (compromiso between 1 and 5) default 3,
  estado_fisico integer check (estado_fisico between 1 and 5) default 3,
  juego_colectivo integer check (juego_colectivo between 1 and 5) default 3,
  fair_play integer check (fair_play between 1 and 5) default 3,
  updated_at timestamptz not null default now()
);

create trigger trg_habilidades_updated_at
  before update on jugador_habilidades
  for each row execute function update_updated_at();


-- 6. TABLA: canchas
create table if not exists canchas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text not null,
  coordenadas text,
  telefono_contacto text,
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

-- 7. TABLA: partidos
create table if not exists partidos (
  id uuid primary key default gen_random_uuid(),
  fecha_hora timestamptz not null,
  cancha_id uuid references canchas(id) on delete restrict,
  lugar text, -- por si no hay cancha registrada
  estado partido_estado not null default 'programado',
  costo numeric(10,2) default 0,
  max_jugadores integer default 10,
  observaciones text,
  equipo_a_nombre text not null default 'Equipo Azul',
  equipo_b_nombre text not null default 'Equipo Rojo',
  equipo_a_color text default '#3b82f6',
  equipo_b_color text default '#ef4444',
  equipo_a_goles integer default 0,
  equipo_b_goles integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_partidos_updated_at before update on partidos for each row execute function update_updated_at();

create index idx_partidos_fecha on partidos(fecha_hora);
create index idx_partidos_estado on partidos(estado);

-- 8. TABLA: asistencia
create table if not exists asistencia (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references partidos(id) on delete cascade,
  jugador_id uuid not null references jugadores(id) on delete cascade,
  estado asistencia_estado not null default 'pendiente',
  fecha_confirmacion timestamptz not null default now(),
  unique(partido_id, jugador_id)
);

create index idx_asistencia_partido on asistencia(partido_id);

-- 9. TABLA: asignacion_equipos
create table if not exists asignacion_equipos (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references partidos(id) on delete cascade,
  jugador_id uuid not null references jugadores(id) on delete cascade,
  equipo text not null check (equipo in ('A', 'B')),
  tipo_sorteo text not null check (tipo_sorteo in ('manual', 'random', 'balanceado')),
  created_at timestamptz not null default now(),
  unique(partido_id, jugador_id)
);

-- 10. TABLA: goles_partido
create table if not exists goles_partido (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references partidos(id) on delete cascade,
  jugador_id uuid not null references jugadores(id) on delete cascade,
  cantidad_goles integer not null default 0 check (cantidad_goles >= 0),
  created_at timestamptz not null default now(),
  unique(partido_id, jugador_id)
);

-- 11. TABLA: evaluaciones (Encuesta Post Partido)
create table if not exists evaluaciones (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references partidos(id) on delete cascade,
  evaluador_id uuid not null references jugadores(id) on delete cascade,
  evaluado_id uuid not null references jugadores(id) on delete cascade,
  estrellas integer not null check (estrellas >= 1 and estrellas <= 5),
  comentario text,
  premio text check (premio in ('MVP', 'Revelación', 'Solidario', 'Limpio', 'Divertido')),
  created_at timestamptz not null default now(),
  unique(partido_id, evaluador_id, evaluado_id),
  check (evaluador_id != evaluado_id)
);

-- 12. TABLA: resenas_partido (General del partido)
create table if not exists resenas_partido (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references partidos(id) on delete cascade,
  jugador_id uuid not null references jugadores(id) on delete cascade,
  opinion text not null,
  created_at timestamptz not null default now(),
  unique(partido_id, jugador_id)
);

-- 13. VISTA MATERIALIZADA: rankings
create materialized view if not exists rankings as
select
  j.id as jugador_id,
  j.nombre_completo,
  j.foto_url,
  coalesce(stats.partidos_jugados, 0) as partidos_jugados,
  coalesce(stats.partidos_ganados, 0) as partidos_ganados,
  coalesce(stats.partidos_perdidos, 0) as partidos_perdidos,
  coalesce(stats.partidos_empatados, 0) as partidos_empatados,
  coalesce(goles.total_goles, 0) as total_goles,
  coalesce(avg_estrellas.promedio, 0) as promedio_estrellas,
  coalesce(avg_estrellas.total_votos, 0) as total_votos_recibidos,
  coalesce(premios.total_mvp, 0) as total_mvp,
  coalesce(asist_historica.asistencias, 0) as asistencias,
  now() as updated_at
from jugadores j
left join (
  select
    ae.jugador_id,
    count(distinct ae.partido_id) as partidos_jugados,
    count(distinct case when p.equipo_a_goles > p.equipo_b_goles and ae.equipo = 'A' then p.id
                        when p.equipo_b_goles > p.equipo_a_goles and ae.equipo = 'B' then p.id end) as partidos_ganados,
    count(distinct case when p.equipo_a_goles < p.equipo_b_goles and ae.equipo = 'A' then p.id
                        when p.equipo_b_goles < p.equipo_a_goles and ae.equipo = 'B' then p.id end) as partidos_perdidos,
    count(distinct case when p.equipo_a_goles = p.equipo_b_goles then p.id end) as partidos_empatados
  from asignacion_equipos ae
  join partidos p on p.id = ae.partido_id and p.estado = 'finalizado'
  group by ae.jugador_id
) stats on stats.jugador_id = j.id
left join (
  select
    evaluado_id,
    round(avg(estrellas)::numeric, 1) as promedio,
    count(*) as total_votos
  from evaluaciones
  group by evaluado_id
) avg_estrellas on avg_estrellas.evaluado_id = j.id
left join (
  select evaluado_id, count(*) as total_mvp
  from evaluaciones
  where premio = 'MVP'
  group by evaluado_id
) premios on premios.evaluado_id = j.id
left join (
  select jugador_id, sum(cantidad_goles) as total_goles
  from goles_partido
  group by jugador_id
) goles on goles.jugador_id = j.id
left join (
  select jugador_id, count(*) as asistencias
  from asistencia
  where estado = 'asisto'
  group by jugador_id
) asist_historica on asist_historica.jugador_id = j.id
with no data;

create unique index if not exists idx_rankings_jugador on rankings(jugador_id);
grant select on rankings to public;

-- Trigger para refrescar rankings
create or replace function refresh_rankings()
returns trigger as $$
begin
  refresh materialized view rankings;
  return null;
end;
$$ language plpgsql security definer;

create trigger trg_refresh_rankings_evaluaciones
  after insert or update or delete on evaluaciones
  for each statement execute function refresh_rankings();

create trigger trg_refresh_rankings_goles
  after insert or update or delete on goles_partido
  for each statement execute function refresh_rankings();

create trigger trg_refresh_rankings_asignacion
  after insert or update or delete on asignacion_equipos
  for each statement execute function refresh_rankings();

create trigger trg_refresh_rankings_asistencia
  after insert or update or delete on asistencia
  for each statement execute function refresh_rankings();


-- ==========================================
-- RLS POLICIES (OPEN SYSTEM)
-- ==========================================

-- Habilitar RLS en todas las tablas y dejarlas abiertas al public (anon o authenticated)
alter table jugadores enable row level security;
create policy "Acceso total jugadores" on jugadores for all using (true) with check (true);

alter table configuracion enable row level security;
create policy "Acceso total configuracion" on configuracion for all using (true) with check (true);

alter table jugador_habilidades enable row level security;
create policy "Acceso total habilidades" on jugador_habilidades for all using (true) with check (true);

alter table canchas enable row level security;
create policy "Acceso total canchas" on canchas for all using (true) with check (true);

alter table partidos enable row level security;
create policy "Acceso total partidos" on partidos for all using (true) with check (true);

alter table asistencia enable row level security;
create policy "Acceso total asistencia" on asistencia for all using (true) with check (true);

alter table asignacion_equipos enable row level security;
create policy "Acceso total asignacion" on asignacion_equipos for all using (true) with check (true);

alter table goles_partido enable row level security;
create policy "Acceso total goles" on goles_partido for all using (true) with check (true);

alter table evaluaciones enable row level security;
create policy "Acceso total evaluaciones" on evaluaciones for all using (true) with check (true);

alter table resenas_partido enable row level security;
create policy "Acceso total resenas" on resenas_partido for all using (true) with check (true);

-- 14. POLÍTICAS DE STORAGE
-- Asumimos que los buckets existen ('fotos-jugadores', 'escudos-equipos')
create policy "Fotos: acceso total" on storage.objects for all using (bucket_id = 'fotos-jugadores') with check (bucket_id = 'fotos-jugadores');
create policy "Escudos: acceso total" on storage.objects for all using (bucket_id = 'escudos-equipos') with check (bucket_id = 'escudos-equipos');

-- 15. FUNCIÓN RPC
create or replace function refresh_rankings_now()
returns json
language plpgsql
security definer
as $$
begin
  refresh materialized view concurrently rankings;
  return json_build_object('success', true, 'message', 'Rankings refreshed', 'timestamp', now());
end;
$$;
