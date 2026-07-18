import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar showNewAsset />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="container py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
