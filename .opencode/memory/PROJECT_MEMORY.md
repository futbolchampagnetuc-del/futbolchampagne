# PROJECT MEMORY

## Sesión: Inicial — Build, Rediseño + Features (24/07/2026)

### Resumen
Sesión completa de bootstrap del proyecto FutbolChampagne (Next.js 15 + Supabase + TypeScript). Se corrigieron errores de compilación, se rediseñó toda la UI con tema champagne premium, se cargaron datos reales del primer partido (28/07/2026, cancha El Último Diez) y se crearon las features de CRUD de jugadores e historial de partidos.

### Archivos modificados/creados
| Archivo | Acción | Propósito |
|---|---|---|
| `src/app/globals.css` | Modificado | Tema champagne premium completo |
| `src/app/layout.tsx` | Modificado | Inter font + metadata premium |
| `src/app/(main)/layout.tsx` | Modificado | Glassmorphism bottom nav |
| `src/app/(main)/page.tsx` | Modificado | Home con próximo partido + historial/sorteo links |
| `src/app/login/page.tsx` | Modificado | Login premium con gradientes |
| `src/components/layout/BottomNav.tsx` | Modificado | Nav con Partidos reemplazando Sorteo |
| `src/components/features/partido/ProximoPartidoClient.tsx` | Modificado | Asistencia premium |
| `src/app/(main)/jugadores/page.tsx` | Modificado | Lista con fotos y características |
| `src/app/(main)/jugadores/[id]/page.tsx` | Modificado | Detalle premium |
| `src/app/(main)/perfil/page.tsx` | Modificado | Stats + form premium |
| `src/app/(main)/sorteo/page.tsx` | Modificado | A/B equipos oro/esmeralda |
| `src/app/(main)/ranking/page.tsx` | Modificado | Podiums oro |
| `src/app/(main)/partido/[id]/page.tsx` | Modificado | VS display premium |
| `src/app/(main)/partido/[id]/evaluar/page.tsx` | Modificado | Evaluación premium |
| `src/app/error.tsx` | Modificado | Premium error page |
| `src/app/not-found.tsx` | Modificado | Premium 404 |
| `src/app/api/auth/callback/route.ts` | Modificado | Fix cookiesToSet `any` |
| `src/app/api/auth/signout/route.ts` | Modificado | Fix cookiesToSet `any` |
| `src/app/api/dev-login/route.ts` | Modificado | Fix session type |
| `next.config.ts` | Modificado | outputFileTracingRoot + Supabase exclusion |
| `tsconfig.json` | Modificado | Excluir `supabase/` del build |
| `public/icons/icon-192x192.svg` | Creado | PWA icon |
| `public/icons/icon-512x512.svg` | Creado | PWA icon |
| `public/manifest.json` | Modificado | Theme color champagne |
| `supabase/seed.sql` | Modificado | Datos reales: cancha, partido, 10 jugadores, asistencias |
| `supabase/migrations/001_initial_schema.sql` | Modificado | RPC function refresh_rankings |
| `supabase/functions/calcular-ranking/index.ts` | Creado | Edge Function ranking |
| `supabase/functions/calcular-ranking/deno.json` | Creado | Deno config |
| `src/actions/jugadores.actions.ts` | Creado | Server actions CRUD jugadores |
| `src/app/(main)/admin/jugadores/page.tsx` | Creado | Admin page jugadores |
| `src/app/(main)/admin/jugadores/AdminJugadoresClient.tsx` | Creado | Client component CRUD |
| `src/app/(main)/partidos/page.tsx` | Creado | Historial de partidos |

### Decisiones clave
1. **Tema champagne premium**: Se eligió `#d4af37` (oro) + `#faf8f5` (crema) + acentos `#0d9488` (esmeralda) para diferenciarse de apps de fútbol genéricas.
2. **Seed con UUIDs fijos**: Se usaron IDs `f0000000-...` para desarrollo porque los jugadores reales se registrarán con Google OAuth y obtendrán sus propios IDs.
3. **CRUD en `/admin/jugadores`**: Página separada del perfil para mantener la separación de concerns. Solo accesible para usuarios autenticados.
4. **Sorteo reemplazado por Partidos en BottomNav**: El sorteo sigue accesible desde la home y desde la página de partido. Partidos es más navegado.
5. **Edge Function en Deno**: `calcular-ranking` usa `deno.land/std` porque las Edge Functions de Supabase corren en Deno, no en Node. El build de Next.js excluye `supabase/` para evitar conflictos.

### Estado actual
- **Build**: ✅ 0 errores, 15 rutas
- **Seed data**: Listo para aplicar con `supabase db reset`
- **Features completadas**: Home, Jugadores (lista + detalle + admin CRUD), Partidos (historial + detalle), Sorteo, Ranking, Perfil, Evaluación
- **Pendientes**: Login con Google OAuth en producción, deploy a Vercel + Supabase, foto upload funcional (requiere bucket storage configurado), Edge Function deploy
