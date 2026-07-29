import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminCanchasClient } from "./AdminCanchasClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminCanchasPage() {
  const supabase = await createServerSupabaseClient();

  const { data: canchas } = await supabase
    .from("canchas")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2">
          <ArrowLeft className="h-4 w-4" />
          Volver a Administración
        </Link>
        <h1 className="text-2xl font-black tracking-tight text-foreground mt-2">Canchas</h1>
        <p className="mt-1 text-sm text-muted-foreground">Administración de complejos deportivos</p>
      </div>
      <div>
        <AdminCanchasClient canchas={canchas || []} />
      </div>
    </div>
  );
}
