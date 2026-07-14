import { requireSession } from "@/lib/session";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          userName={session.user.name}
          userEmail={session.user.email}
          userImage={session.user.image}
          showNewAsset
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="container py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
