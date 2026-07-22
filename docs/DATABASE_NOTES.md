# DATABASE NOTES — FutbolChampagne

## Esquema

### Tablas (7)
| Tabla | Descripción | RLS |
|---|---|---|
| `jugadores` | Perfiles vinculados a auth.users | SELECT todos, UPDATE propio |
| `canchas` | Lugares de juego | CRUD autenticados |
| `partidos` | Encuentros 5vs5 | CRUD autenticados |
| `asistencia` | Confirmación de jugadores | CRUD propio |
| `asignacion_equipos` | Sorteo de equipos | CRUD autenticados |
| `goles_partido` | Goles por jugador | CRUD autenticados |
| `evaluaciones` | Votos post-partido (0-5⭐) | CRUD propio, no autovoto |

### Vista Materializada
`rankings` — Estadísticas agregadas por jugador (PJ, PG, PP, PE, goles, promedio⭐)

## Reglas de Negocio en BD
- ✅ No autovoto: `CHECK(evaluador_id != evaluado_id)`
- ✅ Estrellas 0-5: `CHECK(estrellas >= 0 AND estrellas <= 5)`
- ✅ Partido finalizado validado en Server Action
- ✅ Perfil se crea automáticamente al registrarse (trigger)
- ✅ Rankings se refrescan automáticamente (trigger)

## Seguridad
- 🔒 RLS activado en TODAS las tablas
- 🔒 service_role key solo en Edge Functions
- 🔒 Anon key es pública pero RLS protege los datos
- 🔒 Buckets Storage con políticas RLS
