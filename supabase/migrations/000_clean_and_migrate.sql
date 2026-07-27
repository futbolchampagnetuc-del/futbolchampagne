-- ============================================
-- FutbolChampagne — Script COMPLETO (clean + migrate)
-- ============================================

-- 1. CREAR EXTENSIONES
create extension if not exists "pgcrypto";

-- 2. TABLA: jugadores
create table if not exists jugadores (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_completo text not null,
  email text not null,
  foto_url text,
  altura integer,
  peso numeric(5,1),
  edad integer,
  pie_habil text check (pie_habil in ('izquierdo', 'derecho', 'ambidiestro')),
  numero_dorsal integer,
  equipo_favorito text,
  caracteristica_juego text,
  escudo_equipo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Función para updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger updated_at
drop trigger if exists trg_jugadores_updated_at on jugadores;
create trigger trg_jugadores_updated_at
  before update on jugadores
  for each row execute function update_updated_at();

-- Función: crear perfil automático al registrarse
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.jugadores (id, nombre_completo, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    coalesce(new.email, '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: al crear usuario
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- RLS Jugadores
alter table jugadores enable row level security;

drop policy if exists "Jugadores: lectura para todos los autenticados" on jugadores;
create policy "Jugadores: lectura para todos los autenticados"
  on jugadores for select
  to authenticated
  using (true);

drop policy if exists "Jugadores: actualización solo propio perfil" on jugadores;
create policy "Jugadores: actualización solo propio perfil"
  on jugadores for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- 3. TABLA: canchas
create table if not exists canchas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text not null,
  coordenadas text,
  telefono_contacto text,
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

alter table canchas enable row level security;

drop policy if exists "Canchas: lectura para todos los autenticados" on canchas;
create policy "Canchas: lectura para todos los autenticados"
  on canchas for select
  to authenticated
  using (true);

drop policy if exists "Canchas: inserción para autenticados" on canchas;
create policy "Canchas: inserción para autenticados"
  on canchas for insert
  to authenticated
  with check (true);

drop policy if exists "Canchas: actualización para autenticados" on canchas;
create policy "Canchas: actualización para autenticados"
  on canchas for update
  to authenticated
  using (true);

-- 4. TABLA: partidos
create table if not exists partidos (
  id uuid primary key default gen_random_uuid(),
  fecha_hora timestamptz not null,
  cancha_id uuid not null references canchas(id) on delete restrict,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'jugando', 'finalizado', 'cancelado')),
  equipo_a_nombre text not null default 'Equipo A',
  equipo_b_nombre text not null default 'Equipo B',
  equipo_a_goles integer default 0,
  equipo_b_goles integer default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_partidos_fecha on partidos(fecha_hora);
create index if not exists idx_partidos_estado on partidos(estado);
create index if not exists idx_partidos_cancha on partidos(cancha_id);

alter table partidos enable row level security;

drop policy if exists "Partidos: lectura para todos los autenticados" on partidos;
create policy "Partidos: lectura para todos los autenticados"
  on partidos for select
  to authenticated
  using (true);

drop policy if exists "Partidos: inserción para autenticados" on partidos;
create policy "Partidos: inserción para autenticados"
  on partidos for insert
  to authenticated
  with check (true);

drop policy if exists "Partidos: actualización para autenticados" on partidos;
create policy "Partidos: actualización para autenticados"
  on partidos for update
  to authenticated
  using (true);

-- 5. TABLA: asistencia
create table if not exists asistencia (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references partidos(id) on delete cascade,
  jugador_id uuid not null references jugadores(id) on delete cascade,
  confirmado boolean not null default false,
  fecha_confirmacion timestamptz not null default now(),
  unique(partido_id, jugador_id)
);

create index if not exists idx_asistencia_partido on asistencia(partido_id);
create index if not exists idx_asistencia_jugador on asistencia(jugador_id);

alter table asistencia enable row level security;

drop policy if exists "Asistencia: lectura para todos los autenticados" on asistencia;
create policy "Asistencia: lectura para todos los autenticados"
  on asistencia for select
  to authenticated
  using (true);

drop policy if exists "Asistencia: gestión propia" on asistencia;
create policy "Asistencia: gestión propia"
  on asistencia for insert
  to authenticated
  with check (jugador_id = auth.uid());

drop policy if exists "Asistencia: actualización propia" on asistencia;
create policy "Asistencia: actualización propia"
  on asistencia for update
  to authenticated
  using (jugador_id = auth.uid())
  with check (jugador_id = auth.uid());

drop policy if exists "Asistencia: borrado propio" on asistencia;
create policy "Asistencia: borrado propio"
  on asistencia for delete
  to authenticated
  using (jugador_id = auth.uid());

-- 6. TABLA: asignacion_equipos
create table if not exists asignacion_equipos (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references partidos(id) on delete cascade,
  jugador_id uuid not null references jugadores(id) on delete cascade,
  equipo text not null check (equipo in ('A', 'B')),
  tipo_sorteo text not null check (tipo_sorteo in ('random', 'balanceado')),
  created_at timestamptz not null default now(),
  unique(partido_id, jugador_id)
);

create index if not exists idx_asignacion_partido on asignacion_equipos(partido_id);

alter table asignacion_equipos enable row level security;

drop policy if exists "Asignación: lectura para todos los autenticados" on asignacion_equipos;
create policy "Asignación: lectura para todos los autenticados"
  on asignacion_equipos for select
  to authenticated
  using (true);

drop policy if exists "Asignación: inserción para autenticados" on asignacion_equipos;
create policy "Asignación: inserción para autenticados"
  on asignacion_equipos for insert
  to authenticated
  with check (true);

drop policy if exists "Asignación: borrado para autenticados" on asignacion_equipos;
create policy "Asignación: borrado para autenticados"
  on asignacion_equipos for delete
  to authenticated
  using (true);

-- 7. TABLA: goles_partido
create table if not exists goles_partido (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references partidos(id) on delete cascade,
  jugador_id uuid not null references jugadores(id) on delete cascade,
  cantidad_goles integer not null default 0 check (cantidad_goles >= 0),
  created_at timestamptz not null default now(),
  unique(partido_id, jugador_id)
);

create index if not exists idx_goles_partido on goles_partido(partido_id);
create index if not exists idx_goles_jugador on goles_partido(jugador_id);

alter table goles_partido enable row level security;

drop policy if exists "Goles: lectura para todos los autenticados" on goles_partido;
create policy "Goles: lectura para todos los autenticados"
  on goles_partido for select
  to authenticated
  using (true);

drop policy if exists "Goles: inserción para autenticados" on goles_partido;
create policy "Goles: inserción para autenticados"
  on goles_partido for insert
  to authenticated
  with check (true);

drop policy if exists "Goles: actualización para autenticados" on goles_partido;
create policy "Goles: actualización para autenticados"
  on goles_partido for update
  to authenticated
  using (true);

-- 8. TABLA: evaluaciones
create table if not exists evaluaciones (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references partidos(id) on delete cascade,
  evaluador_id uuid not null references jugadores(id) on delete cascade,
  evaluado_id uuid not null references jugadores(id) on delete cascade,
  estrellas integer not null check (estrellas >= 0 and estrellas <= 5),
  comentario text,
  created_at timestamptz not null default now(),
  unique(partido_id, evaluador_id, evaluado_id),
  check (evaluador_id != evaluado_id)
);

create index if not exists idx_evaluaciones_partido on evaluaciones(partido_id);
create index if not exists idx_evaluaciones_evaluado on evaluaciones(evaluado_id);

alter table evaluaciones enable row level security;

drop policy if exists "Evaluaciones: lectura para todos los autenticados" on evaluaciones;
create policy "Evaluaciones: lectura para todos los autenticados"
  on evaluaciones for select
  to authenticated
  using (true);

drop policy if exists "Evaluaciones: inserción para autenticados" on evaluaciones;
create policy "Evaluaciones: inserción para autenticados"
  on evaluaciones for insert
  to authenticated
  with check (
    evaluador_id = auth.uid() and
    evaluador_id != evaluado_id
  );

drop policy if exists "Evaluaciones: actualización propia" on evaluaciones;
create policy "Evaluaciones: actualización propia"
  on evaluaciones for update
  to authenticated
  using (evaluador_id = auth.uid())
  with check (evaluador_id = auth.uid() and evaluador_id != evaluado_id);

-- 9. VISTA MATERIALIZADA: rankings
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
  now() as updated_at
from jugadores j
left join (
  select ae.jugador_id,
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
  select evaluado_id,
    round(avg(estrellas)::numeric, 1) as promedio,
    count(*) as total_votos
  from evaluaciones
  group by evaluado_id
) avg_estrellas on avg_estrellas.evaluado_id = j.id
left join (
  select jugador_id, sum(cantidad_goles) as total_goles
  from goles_partido
  group by jugador_id
) goles on goles.jugador_id = j.id
with no data;

create unique index if not exists idx_rankings_jugador on rankings(jugador_id);
grant select on rankings to authenticated;

-- Función: refrescar rankings
create or replace function refresh_rankings()
returns trigger as $$
begin
  refresh materialized view concurrently rankings;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_refresh_rankings_evaluaciones on evaluaciones;
create trigger trg_refresh_rankings_evaluaciones
  after insert or update or delete on evaluaciones
  for each statement execute function refresh_rankings();

drop trigger if exists trg_refresh_rankings_goles on goles_partido;
create trigger trg_refresh_rankings_goles
  after insert or update or delete on goles_partido
  for each statement execute function refresh_rankings();

drop trigger if exists trg_refresh_rankings_asignacion on asignacion_equipos;
create trigger trg_refresh_rankings_asignacion
  after insert or update or delete on asignacion_equipos
  for each statement execute function refresh_rankings();

-- 10. POLÍTICAS DE STORAGE
drop policy if exists "Fotos: lectura pública" on storage.objects;
create policy "Fotos: lectura pública"
  on storage.objects for select
  to public
  using (bucket_id = 'fotos-jugadores');

drop policy if exists "Fotos: subida solo propia" on storage.objects;
create policy "Fotos: subida solo propia"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'fotos-jugadores' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Fotos: borrado solo propio" on storage.objects;
create policy "Fotos: borrado solo propio"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'fotos-jugadores' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Escudos: lectura pública" on storage.objects;
create policy "Escudos: lectura pública"
  on storage.objects for select
  to public
  using (bucket_id = 'escudos-equipos');

drop policy if exists "Escudos: subida para autenticados" on storage.objects;
create policy "Escudos: subida para autenticados"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'escudos-equipos');

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
