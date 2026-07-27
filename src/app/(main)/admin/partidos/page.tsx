import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminPartidosClient } from "./AdminPartidosClient";
import Link from "next/link";

export default async function AdminPartidosPage() {
  const supabase = await createServerSupabaseClient();

  const [partidosRes, canchasRes] = await Promise.all([
    supabase.from("partidos").select("*").order("fecha_hora", { ascending: false }),
    supabase.from("canchas").select("*").order("nombre", { ascending: true })
  ]);

  return (
    <div className="flex flex-col gap-6 pb-24 animate-fade-in">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6b7280] hover:text-[#1a1a2e] transition-colors mb-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Volver a Administración
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#1a1a2e]">Partidos</h1>
        <p className="mt-1 text-sm text-[#6b7280]">Gestión de turnos y encuentros</p>
      </div>
      <div>
        <AdminPartidosClient 
          partidos={partidosRes.data || []} 
          canchas={canchasRes.data || []} 
        />
      </div>
    </div>
  );
}
