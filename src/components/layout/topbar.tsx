"use client";

import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  showNewAsset?: boolean;
}

export function Topbar({ showNewAsset }: TopbarProps) {
  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-border bg-surface/80 px-6 backdrop-blur-sm">
      <button
        className="flex h-9 w-full max-w-sm items-center gap-2 rounded-md border border-input bg-surface px-3 text-sm text-muted-foreground transition-colors hover:border-ring"
        onClick={() => document.dispatchEvent(new CustomEvent("open-command-palette"))}
      >
        <Search className="size-4" />
        <span>Search assets, vendors, tags…</span>
        <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono">
          ⌘K
        </kbd>
      </button>

      <div className="flex items-center gap-2">
        {showNewAsset && (
          <Button size="sm" asChild>
            <Link href="/assets?new=1">
              <Plus className="size-4" />
              New asset
            </Link>
          </Button>
        )}
        <ThemeToggle />
        <NotificationBell />
      </div>
    </header>
  );
}
