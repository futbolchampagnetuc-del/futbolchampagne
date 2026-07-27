-- ============================================
-- FutbolChampagne — Seed Data REAL 🥂 (v2)
-- ============================================

-- 0. CONFIGURACIÓN
INSERT INTO configuracion (id, nombre_torneo, max_jugadores_default, duracion_partido_minutos, sistema_puntuacion)
VALUES (
  1,
  'FutbolChampagne',
  10,
  60,
  'clasico'
) ON CONFLICT (id) DO NOTHING;

-- 5. CANCHAS
INSERT INTO canchas (id, nombre, ubicacion, tipo_superficie, precio_hora)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'El Último 10', 'Complejo Norte', 'sintetico', 15000),
  ('c0000000-0000-0000-0000-000000000002', 'La Bombonerita', 'Centro', 'sintetico', 12000)
ON CONFLICT (id) DO NOTHING;

-- 6. PARTIDOS
INSERT INTO partidos (id, fecha, hora, cancha_id, estado)
VALUES
  -- Partido pasado (para stats)
  ('p0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '7 days', '21:00:00', 'c0000000-0000-0000-0000-000000000001', 'finalizado'),
  -- Partido próximo
  ('p0000000-0000-0000-0000-000000000002', CURRENT_DATE + INTERVAL '1 day', '21:00:00', 'c0000000-0000-0000-0000-000000000001', 'abierto')
ON CONFLICT (id) DO NOTHING;

-- 3. JUGADORES (para desarrollo)
INSERT INTO jugadores (id, rol, nombre_completo, email, foto_url, numero_dorsal, equipo_favorito, caracteristica_juego, posiciones, pie_habil, talle_camiseta)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'admin', 'Ezequiel', 'ezequiel@futbolchampagne.com', NULL, 10, 'Boca Juniors', 'técnica', ARRAY['Enganche', 'Delantero'], ARRAY['Derecho'], 'L'),
  ('f0000000-0000-0000-0000-000000000002', 'jugador', 'Gordo', 'gordo@futbolchampagne.com', NULL, 9, NULL, 'físico', ARRAY['Delantero'], ARRAY['Derecho'], 'XL'),
  ('f0000000-0000-0000-0000-000000000003', 'jugador', 'Luiggi', 'luiggi@futbolchampagne.com', NULL, 7, NULL, 'técnica', ARRAY['Volante'], ARRAY['Derecho'], 'M'),
  ('f0000000-0000-0000-0000-000000000004', 'jugador', 'Mudo', 'mudo@futbolchampagne.com', NULL, 5, NULL, 'defensa', ARRAY['Defensor'], ARRAY['Izquierdo'], 'L'),
  ('f0000000-0000-0000-0000-000000000005', 'jugador', 'UB', 'ub@futbolchampagne.com', NULL, 11, NULL, 'velocidad', ARRAY['Lateral', 'Volante'], ARRAY['Ambos'], 'L'),
  ('f0000000-0000-0000-0000-000000000006', 'jugador', 'Joako', 'joako@futbolchampagne.com', NULL, 8, NULL, 'visión', ARRAY['Volante'], ARRAY['Derecho'], 'M'),
  ('f0000000-0000-0000-0000-000000000007', 'jugador', 'Nico', 'nico@futbolchampagne.com', NULL, 6, 'River Plate', 'capacidad_aérea', ARRAY['Defensor'], ARRAY['Izquierdo'], 'XL'),
  ('f0000000-0000-0000-0000-000000000008', 'jugador', 'Toro', 'toro@futbolchampagne.com', NULL, 4, NULL, 'físico', ARRAY['Defensor'], ARRAY['Derecho'], 'XXL'),
  ('f0000000-0000-0000-0000-000000000009', 'jugador', 'Bruno', 'bruno@futbolchampagne.com', NULL, 2, NULL, 'liderazgo', ARRAY['Arquero', 'Defensor'], ARRAY['Derecho'], 'L'),
  ('f0000000-0000-0000-0000-000000000010', 'jugador', 'Jure', 'jure@futbolchampagne.com', NULL, 3, NULL, 'defensa', ARRAY['Defensor'], ARRAY['Derecho'], 'M')
ON CONFLICT (id) DO NOTHING;

-- 4. HABILIDADES
INSERT INTO jugador_habilidades (jugador_id, velocidad, resistencia, fuerza, quite, marcacion, pase, vision, pegada, definicion, cabezazo, juego_aereo, liderazgo, compromiso, estado_fisico, juego_colectivo, fair_play)
SELECT id, 
  floor(random() * 5 + 1)::int,
  floor(random() * 5 + 1)::int,
  floor(random() * 5 + 1)::int,
  floor(random() * 5 + 1)::int,
  floor(random() * 5 + 1)::int,
  floor(random() * 5 + 1)::int,
  floor(random() * 5 + 1)::int,
  floor(random() * 5 + 1)::int,
  floor(random() * 5 + 1)::int,
  floor(random() * 5 + 1)::int,
  floor(random() * 5 + 1)::int,
  floor(random() * 5 + 1)::int,
  floor(random() * 5 + 1)::int,
  floor(random() * 5 + 1)::int,
  floor(random() * 5 + 1)::int,
  floor(random() * 5 + 1)::int
FROM jugadores
ON CONFLICT (jugador_id) DO NOTHING;

-- 5. ASISTENCIA: Todos confirmados
INSERT INTO asistencia (partido_id, jugador_id, estado, fecha_confirmacion)
SELECT 'p0000000-0000-0000-0000-000000000001', id, 'asisto', now()
FROM jugadores
WHERE id IN (
  'f0000000-0000-0000-0000-000000000001',
  'f0000000-0000-0000-0000-000000000002',
  'f0000000-0000-0000-0000-000000000003',
  'f0000000-0000-0000-0000-000000000004',
  'f0000000-0000-0000-0000-000000000005',
  'f0000000-0000-0000-0000-000000000006',
  'f0000000-0000-0000-0000-000000000007',
  'f0000000-0000-0000-0000-000000000008',
  'f0000000-0000-0000-0000-000000000009',
  'f0000000-0000-0000-0000-000000000010'
)
ON CONFLICT (partido_id, jugador_id) DO NOTHING;
