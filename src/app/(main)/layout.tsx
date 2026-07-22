import { BottomNav } from "@/components/layout/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-screen max-w-lg bg-white">
      <main className="has-bottom-nav px-4 pb-4 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
