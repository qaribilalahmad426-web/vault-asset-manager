"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, LogOut, Plus } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

interface TopbarProps {
  userName: string;
  userEmail: string;
  userImage?: string | null;
  showNewAsset?: boolean;
}

export function Topbar({ userName, userEmail, userImage, showNewAsset }: TopbarProps) {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  }

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar>
                {userImage && <AvatarImage src={userImage} alt={userName} />}
                <AvatarFallback>{initials(userName)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{userName}</span>
                <span className="text-xs text-muted-foreground">{userEmail}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} destructive>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
