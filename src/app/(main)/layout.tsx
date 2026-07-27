import { BottomNav } from "@/components/layout/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto min-h-screen max-w-lg bg-background">
      {/* Header decorativo */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <main className="relative has-bottom-nav px-5 pb-4 pt-6 animate-fade-in">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
