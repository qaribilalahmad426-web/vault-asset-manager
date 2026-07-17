"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  CalendarDays,
  BarChart3,
  Sparkles,
  Settings,
  Layers,
  ChevronsLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, phase: 1 },
  { href: "/assets", label: "Assets", icon: Boxes, phase: 1 },
  { href: "/dashboard#calendar", label: "Calendar", icon: CalendarDays, phase: 1 },
  { href: "/analytics", label: "Analytics", icon: BarChart3, phase: 2 },
  { href: "/credits", label: "Credits", icon: Sparkles, phase: 3 },
  { href: "/settings", label: "Settings", icon: Settings, phase: 1 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUiStore();

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-surface transition-all duration-200",
        sidebarCollapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Layers className="size-4" />
        </div>
        {!sidebarCollapsed && <span className="text-sm font-semibold">Vault</span>}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
        {navItems.map((item) => {
          const itemBasePath = item.href.split("#")[0];
          const active = pathname === itemBasePath || (pathname.startsWith(itemBasePath + "/") && itemBasePath !== "/dashboard");
          const disabled = item.phase > 1;
          const Content = (
            <>
              <item.icon className="size-4 shrink-0" />
              {!sidebarCollapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!sidebarCollapsed && disabled && (
                <Badge variant="secondary" className="text-[10px]">
                  Phase {item.phase}
                </Badge>
              )}
            </>
          );

          return disabled ? (
            <div
              key={item.href}
              title={`Coming in Phase ${item.phase}`}
              className="flex cursor-not-allowed items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground/50"
            >
              {Content}
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {Content}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={toggleSidebar}
        className="flex items-center gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground hover:text-foreground"
      >
        <ChevronsLeft className={cn("size-4 transition-transform", sidebarCollapsed && "rotate-180")} />
        {!sidebarCollapsed && "Collapse"}
      </button>
    </aside>
  );
}
