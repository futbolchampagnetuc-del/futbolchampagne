# PROJECT_MEMORY — FutbolChampagne

## Sesión: 2026-07-22 — Bootstrap Inicial (COMPLETADO)

### Resumen
Se bootstraped el proyecto completo desde cero: Next.js + TypeScript + Tailwind + Supabase.
El build compila exitosamente. Pendiente de configuración de Supabase en Dashboard.

### Archivos creados
- **Config**: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.env.example`, `.gitignore`
- **Estilos**: `src/app/globals.css` (Tailwind v4 con tema verde)
- **Supabase**: 
  - `src/lib/supabase/client.ts`, `server.ts`, `admin.ts`, `middleware.ts`
  - `src/middleware.ts` (protección de rutas)
  - `supabase/migrations/001_initial_schema.sql` (7 tablas + RLS + triggers)
  - `supabase/seed.sql`
- **Auth**: `src/app/login/page.tsx` (Google OAuth), `auth/callback/route.ts`, `auth/signout/route.ts`
- **Layout**: Bottom Nav con 5 tabs (Inicio, Jugadores, Sorteo, Ranking, Perfil)
- **Páginas**: Home, Jugadores (lista+detalle), Sorteo, Ranking, Perfil, Partido detalle, Evaluar
- **Componentes**: StarRating, AvatarWithName, PartidoGolesClient, ProximoPartidoClient, SorteoClient, PerfilForm, EvaluacionForm
- **Actions**: asistencia, perfil, evaluacion, sorteo
- **PWA**: manifest.json, service worker
- **Docs**: ADR-001, SUPABASE-SETUP.md, DATABASE_NOTES.md

### Estado del build
✅ Compilación exitosa (TypeScript + Next.js)
⚠️ Requiere `.env.local` con credenciales de Supabase para funcionar

### Pendiente (usuario)
1. Crear proyecto en Supabase Dashboard
2. Configurar Google OAuth (Google Cloud Console + Supabase)
3. Copiar `.env.example` a `.env.local` y completar credenciales
4. Ejecutar migración SQL (desde Supabase SQL Editor o CLI)
5. Opcional: subir seed data
6. `npm run dev` para ver la app funcionando
7. Desplegar en Vercel
