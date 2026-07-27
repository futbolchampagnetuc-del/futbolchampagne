-- ============================================
-- FutbolChampagne — Migración 002: Comentarios
-- ============================================

create table if not exists comentarios_partido (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references partidos(id) on delete cascade,
  jugador_id uuid not null references jugadores(id) on delete cascade,
  texto text not null,
  created_at timestamptz not null default now()
);

-- Habilitar RLS (Open System)
alter table comentarios_partido enable row level security;
create policy "Acceso total comentarios" on comentarios_partido for all using (true) with check (true);

-- Índices útiles para mejorar la velocidad al cargar un partido
create index if not exists idx_comentarios_partido on comentarios_partido(partido_id);
create index if not exists idx_comentarios_fecha on comentarios_partido(created_at);
