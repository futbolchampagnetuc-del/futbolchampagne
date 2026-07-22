# PROJECT_PROFILE: FutbolChampagne

## Datos Generales
- **Nombre:** FutbolChampagne
- **Tipo:** Webapp mobile-first de fútbol 5vs5 entre amigos
- **Stack:** Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + Supabase
- **Hosting:** Vercel (target)
- **Estado:** ✅ Bootstrap completado — Esperando configuración de Supabase

## Stack Detallado
| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 App Router, TypeScript, Tailwind CSS v4 |
| Backend | Supabase (PostgreSQL + Auth + RLS + Edge Functions) |
| Base de Datos | PostgreSQL 15+ (vía Supabase) |
| Autenticación | Supabase Auth con Google OAuth |
| Storage | Supabase Storage (fotos jugadores, escudos equipos) |
| Tiempo Real | Supabase Realtime (asistencia en vivo) |

## Estructura del proyecto
```
src/
  app/              # App Router (páginas + layouts)
    (main)/         # Grupo con Bottom Navigation
    login/          # Login con Google
    auth/           # Callback + signout
  components/
    ui/             # (reservado para shadcn/ui)
    features/       # Componentes de negocio
    layout/         # BottomNav
    shared/         # StarRating, AvatarWithName
  lib/supabase/     # client, server, admin, middleware
  actions/          # Server Actions (asistencia, perfil, evaluacion, sorteo)
  hooks/            # useAsistencia, useRealtime
  types/            # database, models
supabase/
  migrations/       # 001_initial_schema.sql
  seed.sql          # Datos de ejemplo
  functions/        # Edge Functions (calcular-ranking)
```

## Módulos Implementados
1. ✅ **Home / Próximo Partido** — Fecha, hora, cancha, asistencia con toggle
2. ✅ **Jugadores** — Lista + detalle con foto, características, equipo favorito, rating
3. ✅ **Sorteo de Equipos** — Random (A/B) y Balanceado (greedy por rating)
4. ✅ **Ranking** — Goleadores, estadísticas (PJ, PG, PP, PE, goles, ⭐)
5. ✅ **Perfil** — Edición de datos, foto desde cámara, historial
6. ✅ **Evaluación Post-Partido** — Voto 0-5⭐ + comentario a cada compañero

## Próximos pasos (para el usuario)
1. Crear proyecto en supabase.com
2. Configurar Google OAuth
3. Completar `.env.local`
4. Aplicar migración SQL
5. `npm run dev`
