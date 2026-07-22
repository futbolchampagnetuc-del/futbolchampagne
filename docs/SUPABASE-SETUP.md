# SUPABASE SETUP — FutbolChampagne

## 1. Crear proyecto en Supabase
1. Ir a https://supabase.com/dashboard
2. Crear nuevo proyecto → "FutbolChampagne"
3. Elegir región cercana
4. Guardar las credenciales de `Settings → API`:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Configurar Google OAuth

### En Google Cloud Console
1. Ir a https://console.cloud.google.com
2. Crear proyecto o seleccionar existente
3. APIs & Services → Credentials → Crear OAuth 2.0 Client ID
4. Application type: Web application
5. Authorized redirect URIs:
   - `https://[PROJECT_ID].supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback`
   - `https://[TU_DOMINIO]/auth/callback`

### En Supabase Dashboard
1. Authentication → Providers → Google
2. Activar y pegar Client ID y Client Secret de Google
3. Guardar

## 3. Aplicar migraciones
```bash
# Instalar Supabase CLI
npm install -g supabase

# Vincular proyecto
supabase link --project-ref [PROJECT_ID]

# Aplicar migración
supabase db push

# Cargar seed data
supabase db reset
```

## 4. Configurar Storage
En Supabase Dashboard → Storage:
- Crear bucket `fotos-jugadores` (público)
- Crear bucket `escudos-equipos` (público)
- Las políticas RLS se aplican con la migración SQL

## 5. Configurar Realtime
Supabase Dashboard → Database → Replication:
- Habilitar Realtime para tablas: `asistencia`, `partidos`

## Variables de entorno (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
