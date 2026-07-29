"use client";

import { useState, useEffect } from "react";
import { Footprints, Trophy, Goal } from "lucide-react";

export function SplashIntro({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("futbol-splash-seen");
    if (seen) {
      setShowSplash(false);
    }
  }, []);

  if (!showSplash) return <>{children}</>;

  const handleEnter = () => {
    setExiting(true);
    setTimeout(() => {
      localStorage.setItem("futbol-splash-seen", "true");
      setShowSplash(false);
    }, 500);
  };

  return (
    <>
      {showSplash && (
        <div
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0a0f] via-[#0d2818] to-[#0a0a0f] transition-opacity duration-500 ${
            exiting ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[min(500px,150vw)] h-[min(500px,150vw)] rounded-full border border-[#d4af37]/5" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[min(350px,100vw)] h-[min(350px,100vw)] rounded-full border border-[#d4af37]/10" />
            <div className="hidden sm:block absolute top-5 left-5 w-20 h-20 rounded-full bg-[#d4af37]/5 animate-spin-slow" />
            <div className="hidden sm:block absolute bottom-10 right-10 w-16 h-16 rounded-full bg-[#2e7d32]/10 animate-spin-slow" style={{ animationDirection: "reverse" }} />
          </div>

          <div className="relative z-10 flex flex-col items-center px-6 w-full max-w-sm mx-auto">
            <div className="mb-6 relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8860b] flex items-center justify-center shadow-2xl animate-bounce-in">
                <Goal className="w-12 h-12 sm:w-14 sm:h-14 text-[#0a0a0f]" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#2e7d32] flex items-center justify-center animate-bounce-in" style={{ animationDelay: "0.3s" }}>
                <Footprints className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -left-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#d4af37]/20 flex items-center justify-center animate-bounce-in" style={{ animationDelay: "0.5s" }}>
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-[#d4af37]" />
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-center break-words">
              <span className="text-gradient-gold">Fútbol</span>
              <span className="text-white">Champagne</span>
            </h1>

            <div className="mt-3 flex items-center gap-2">
              <div className="h-px w-6 sm:w-8 bg-gradient-to-r from-transparent to-[#d4af37]/50" />
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#d4af37]/60 font-semibold whitespace-nowrap">5 Fútbol 5</span>
              <div className="h-px w-6 sm:w-8 bg-gradient-to-r from-[#d4af37]/50 to-transparent" />
            </div>

            <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-[#9ca3af] text-center px-4 leading-relaxed">
              Gestioná tus partidos, seguí tus estadísticas y vivilo con estilo
            </p>

            <button
              onClick={handleEnter}
              className="mt-8 sm:mt-10 btn-gold px-8 sm:px-10 py-3 sm:py-3.5 rounded-2xl text-sm sm:text-base font-bold tracking-wide uppercase"
            >
              Iniciar
            </button>

            <div className="mt-6 sm:mt-8 flex gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#d4af37]/30 animate-flicker"
                  style={{ animationDelay: `${i * 0.5}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      <div className={exiting ? "" : ""}>
        {children}
      </div>
    </>
  );
}
