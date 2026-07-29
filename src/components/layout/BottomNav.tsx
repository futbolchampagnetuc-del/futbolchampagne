"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Users, Calendar, Trophy, ShieldAlert } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/jugadores", label: "Jugadores", icon: Users },
    { href: "/partidos", label: "Partidos", icon: Calendar },
    { href: "/ranking", label: "Ranking", icon: Trophy },
    { href: "/admin", label: "Admin", icon: ShieldAlert },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-1 sm:px-2 pt-1.5 pb-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-1 sm:px-2 py-1 text-[0.55rem] sm:text-[0.65rem] font-semibold uppercase tracking-wider transition-all duration-200 min-w-0",
                isActive
                  ? "text-[#d4af37]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "rounded-xl p-1 sm:p-1.5 transition-all duration-200",
                isActive
                  ? "bg-[#d4af37]/10 text-[#d4af37]"
                  : "text-muted-foreground"
              )}>
                <item.icon className={cn(
                  "h-[18px] w-[18px] sm:h-5 sm:w-5 transition-all",
                  isActive ? "scale-110" : ""
                )} strokeWidth={isActive ? 2.5 : 1.5} />
              </div>
              <span className="truncate max-w-full">{item.label}</span>
              {isActive && (
                <span className="absolute -top-[1px] left-1/2 h-[3px] w-6 sm:w-8 -translate-x-1/2 rounded-full bg-[#d4af37]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
