import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const supabase = await createServerSupabaseClient();

    // Obtener próximo partido
  const { data: partidosList } = await supabase
    .from("partidos")
    .select("*, cancha:canchas(*)")
    .eq("estado", "programado")
    .gte("fecha_hora", new Date().toISOString())
    .order("fecha_hora", { ascending: true })
    .limit(1);

  const partido = partidosList && partidosList.length > 0
    ? partidosList[0] as unknown as {
        id: string;
        fecha_hora: string;
        cancha: { nombre: string; direccion: string };
      }
    : null;

  // Si no hay próximo partido
  if (!partido) {
    return (
      <div className="flex flex-col items-center justify-center pt-16 pb-12 animate-fade-in">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#b8860b]/10">
          <span className="text-5xl">⚽</span>
        </div>
        <h2 className="text-xl font-bold text-[#1a1a2e]">
          No hay próximo partido
        </h2>
        <p className="mt-2 text-center text-[#6b7280] max-w-xs">
          Cuando alguien cree un partido, lo verás acá
        </p>
        <div className="mt-8 h-px w-16 bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />
      </div>
    );
  }

  // Obtener equipos formados para este partido
  const { data: asignacionesRaw } = await supabase
    .from("asignacion_equipos")
    .select("*, jugador:jugadores(nombre_completo, foto_url)")
    .eq("partido_id", partido.id);

  const asignaciones = (asignacionesRaw || []) as unknown as {
    equipo: "A" | "B";
    jugador: { nombre_completo: string; foto_url: string | null };
  }[];

  const equipoA = asignaciones.filter((a) => a.equipo === "A");
  const equipoB = asignaciones.filter((a) => a.equipo === "B");

  return (
    <div className="space-y-5 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1a1a2e]">
            Próximo Partido
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            ¡Preparate para el encuentro!
          </p>
        </div>
      </div>

      {/* Card del partido premium */}
      <div className="card-premium overflow-hidden">
        {/* Barra decorativa superior */}
        <div className="h-1 bg-gradient-to-r from-[#d4af37] via-[#b8860b] to-[#d4af37]" />

        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              {/* Fecha y hora */}
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d4af37]/10">
                  <svg className="h-5 w-5 text-[#c9952a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#1a1a2e]">
                    {formatDateTime(partido.fecha_hora)}
                  </p>
                </div>
              </div>

              {/* Cancha */}
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0d9488]/10">
                  <svg className="h-5 w-5 text-[#0d9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-[#1a1a2e]">
                    {partido.cancha?.nombre}
                  </p>
                  <p className="text-sm text-[#6b7280]">
                    {partido.cancha?.direccion}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Equipos Formados */}
      {(equipoA.length > 0 || equipoB.length > 0) ? (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1a1a2e]">Equipos Confirmados</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {/* EQUIPO A */}
            <div className="card-premium overflow-hidden border-t-4 border-t-blue-500">
              <div className="bg-blue-50/50 p-2 text-center border-b border-gray-100">
                <h3 className="font-bold text-blue-900">Equipo A</h3>
              </div>
              <div className="p-2 space-y-1">
                {equipoA.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                      {a.jugador?.nombre_completo?.charAt(0) || "?"}
                    </div>
                    <span className="text-xs font-medium text-gray-700 truncate">
                      {a.jugador?.nombre_completo}
                    </span>
                  </div>
                ))}
                {equipoA.length === 0 && (
                  <p className="text-xs text-center text-gray-400 py-4">Sin jugadores</p>
                )}
              </div>
            </div>

            {/* EQUIPO B */}
            <div className="card-premium overflow-hidden border-t-4 border-t-red-500">
              <div className="bg-red-50/50 p-2 text-center border-b border-gray-100">
                <h3 className="font-bold text-red-900">Equipo B</h3>
              </div>
              <div className="p-2 space-y-1">
                {equipoB.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">
                      {a.jugador?.nombre_completo?.charAt(0) || "?"}
                    </div>
                    <span className="text-xs font-medium text-gray-700 truncate">
                      {a.jugador?.nombre_completo}
                    </span>
                  </div>
                ))}
                {equipoB.length === 0 && (
                  <p className="text-xs text-center text-gray-400 py-4">Sin jugadores</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-premium p-6 text-center">
          <p className="text-sm text-[#6b7280]">
            Los equipos aún no han sido armados.
          </p>
        </div>
      )}
    </div>
  );
  } catch (error: any) {
    return (
      <div className="flex flex-col items-center justify-center pt-16 pb-12 px-4 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <span className="text-4xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold text-red-600 mb-2">Error de Conexión</h2>
        <p className="text-sm text-gray-600 mb-4">
          Ocurrió un error al intentar conectarse a la base de datos.
        </p>
        <div className="bg-gray-100 p-4 rounded text-left text-xs text-gray-800 w-full overflow-auto">
          <code>{error?.message || String(error)}</code>
        </div>
        <p className="mt-6 text-sm font-semibold text-gray-700">
          Probablemente falten las variables de entorno (NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY) en Netlify. ¡Asegurate de agregarlas y volver a compilar!
        </p>
      </div>
    );
  }
}
