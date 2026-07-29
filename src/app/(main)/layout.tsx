import { BottomNav } from "@/components/layout/BottomNav";
import { SplashIntro } from "@/components/features/home/SplashIntro";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SplashIntro>
      <div className="relative mx-auto min-h-screen max-w-lg bg-background">
        {/* Barra decorativa superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#d4af37]" />

        {/* Background sutil de cancha */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[#2e7d32]/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-[#d4af37]/5 blur-3xl" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] opacity-[0.02]" style={{
            backgroundImage: "radial-gradient(circle, #d4af37 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }} />
        </div>

        <main className="relative has-bottom-nav px-4 sm:px-5 pb-4 pt-5 sm:pt-6 animate-fade-in">
          {children}
        </main>

        <BottomNav />
      </div>
    </SplashIntro>
  );
}
