"use client";

import Link from "next/link";
import { Users, Calendar, MapPin } from "lucide-react";

export default function AdminPage() {
  const adminLinks = [
    {
      title: "Jugadores",
      description: "Gestionar jugadores registrados, habilidades y fotos.",
      href: "/admin/jugadores",
      icon: Users,
    },
    {
      title: "Partidos",
      description: "Crear turnos, administrar estado de los partidos.",
      href: "/admin/partidos",
      icon: Calendar,
    },
    {
      title: "Canchas",
      description: "Gestionar complejos y ubicaciones.",
      href: "/admin/canchas",
      icon: MapPin,
    }
  ];

  return (
    <div className="flex flex-col gap-6 pb-24 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#1a1a2e]">Administración</h1>
        <p className="mt-1 text-sm text-[#6b7280]">Panel de control del sistema (Acceso Abierto)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adminLinks.map((link) => (
          <div key={link.href} className="card-premium flex flex-col p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#c9952a]">
                <link.icon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-[#1a1a2e]">{link.title}</h2>
            </div>
            <p className="text-sm text-[#6b7280] mb-4">{link.description}</p>
            <div className="mt-auto">
              <Link href={link.href} className="btn-primary w-full text-center block py-2 rounded-lg font-medium">
                Ingresar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
