-- ============================================
-- FutbolChampagne — Seed Data
-- ============================================
-- NOTA: Los jugadores se crean automáticamente
-- cuando inician sesión con Google (trigger on_auth_user_created).
-- Este seed es para desarrollo con datos de ejemplo.

-- 1. CANCHAS
insert into canchas (id, nombre, direccion) values
  ('a0000000-0000-0000-0000-000000000001', 'Parque Centenario', 'Av. Díaz Vélez 4700, CABA'),
  ('a0000000-0000-0000-0000-000000000002', 'Club Villa Crespo', 'Av. Corrientes 5400, CABA')
on conflict do nothing;

-- 2. PARTIDOS
insert into partidos (id, fecha_hora, cancha_id, estado, equipo_a_nombre, equipo_b_nombre, equipo_a_goles, equipo_b_goles) values
  ('b0000000-0000-0000-0000-000000000001', now() - interval '3 days', 'a0000000-0000-0000-0000-000000000001', 'finalizado', 'Los Crack', 'Los Pibes', 5, 3),
  ('b0000000-0000-0000-0000-000000000002', now() - interval '1 day', 'a0000000-0000-0000-0000-000000000002', 'finalizado', 'FC Barcelona', 'Real Madrid', 4, 4),
  ('b0000000-0000-0000-0000-000000000003', now() + interval '5 days', 'a0000000-0000-0000-0000-000000000001', 'pendiente', 'Equipo A', 'Equipo B', 0, 0)
on conflict do nothing;
