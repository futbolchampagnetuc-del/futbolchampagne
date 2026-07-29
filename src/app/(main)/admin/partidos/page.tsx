import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminPartidosClient } from "./AdminPartidosClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminPartidosPage() {
  const supabase = await createServerSupabaseClient();

  const [partidosRes, canchasRes] = await Promise.all([
    supabase.from("partidos").select("*").order("fecha_hora", { ascending: false }),
    supabase.from("canchas").select("*").order("nombre", { ascending: true })
  ]);

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2">
          <ArrowLeft className="h-4 w-4" />
          Volver a Administración
        </Link>
        <h1 className="text-2xl font-black tracking-tight text-foreground mt-2">Partidos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gestión de turnos y encuentros</p>
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
