"use client";

import Link from "next/link";
import { Users, Calendar, MapPin, ShieldAlert, ChevronRight } from "lucide-react";

export default function AdminPage() {
  const adminLinks = [
    { title: "Jugadores", description: "Gestionar jugadores, habilidades y fotos", href: "/admin/jugadores", icon: Users },
    { title: "Partidos", description: "Crear turnos y administrar partidos", href: "/admin/partidos", icon: Calendar },
    { title: "Canchas", description: "Gestionar complejos y ubicaciones", href: "/admin/canchas", icon: MapPin },
  ];

  return (
    <div className="space-y-5 animate-fade-in pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Panel de control</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-[#d4af37]" />
        </div>
      </div>

      <div className="space-y-3">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="card-dark rounded-2xl flex items-center gap-4 p-5 transition-all hover:border-[#d4af37]/30 active:scale-[0.99]"
          >
            <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 flex items-center justify-center shrink-0">
              <link.icon className="w-6 h-6 text-[#d4af37]" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-foreground">{link.title}</h2>
              <p className="text-sm text-muted-foreground">{link.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/40 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
