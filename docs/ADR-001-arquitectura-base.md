# ADR-001: Arquitectura Base para FutbolChampagne

## Fecha
2026-07-22

## Estado
Aprobado

## Contexto
FutbolChampagne es una webapp mobile-first para gestionar partidos de fútbol 5vs5 entre amigos. Stack: Next.js 14+ (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Supabase.

## Decisiones

| Decisión | Opción | Motivo |
|---|---|---|
| Router | App Router | Server Components, layouts anidados, Server Actions |
| Navegación | Bottom Nav 5 tabs | Experiencia mobile nativa |
| Capas | app/ → features/ → ui/ → lib/ | Dependencias unidireccionales |
| Datos | Server Components + Realtime + Server Actions | Máximo rendimiento mobile |
| PWA | manifest.json + service worker | Instalación sin App Store |
| Sorteo | Algoritmo greedy por rating | Sin IA, simple y justo |

## Consecuencias
- **+** Rendimiento mobile superior
- **+** Experiencia cercana a app nativa
- **+** Sin boilerplate de API (Server Actions)
- **-** Requiere conocimiento de Server Components
- **-** RLS puede volverse complejo

## Estructura de directorios
```
src/
  app/              # App Router (páginas)
  components/
    ui/             # shadcn/ui base
    features/       # Componentes de negocio
    layout/         # BottomNav, shells
    shared/         # StarRating, AvatarWithName
  lib/supabase/     # client.ts, server.ts, admin.ts
  actions/          # Server Actions
  hooks/            # Custom hooks
  types/            # Database + models
```
