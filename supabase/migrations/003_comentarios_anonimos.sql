-- ============================================
-- FutbolChampagne — Migración 003: Comentarios Anónimos
-- ============================================

-- Hacer que jugador_id sea opcional (ya que el usuario escribirá su propio nombre)
alter table comentarios_partido alter column jugador_id drop not null;

-- Agregar columna para el nombre del redactor (autor)
alter table comentarios_partido add column if not exists autor_nombre text not null default 'Anónimo';
