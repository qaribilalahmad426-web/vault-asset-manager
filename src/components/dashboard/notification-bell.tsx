"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import { Bell, Check, X, Loader2 } from "lucide-react";
import { getNotifications } from "@/features/notifications/actions";
import { useUiStore, selectVisibleNotifications, selectUnreadCount } from "@/store/ui-store";
import { Button } from "@/components/ui/button";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import type { NotificationUrgency } from "@/types";

const urgencyDot: Record<NotificationUrgency, string> = {
  safe: "bg-success",
  upcoming: "bg-success",
  soon: "bg-warning",
  urgent: "bg-destructive",
  expired: "bg-muted-foreground",
};

export function NotificationBell() {
  const notifications = useUiStore(selectVisibleNotifications);
  const unreadCount = useUiStore(selectUnreadCount);
  const readIds = useUiStore((s) => s.readIds);
  const setNotifications = useUiStore((s) => s.setNotifications);
  const markAsRead = useUiStore((s) => s.markAsRead);
  const markAllAsRead = useUiStore((s) => s.markAllAsRead);
  const dismissNotification = useUiStore((s) => s.dismissNotification);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const items = await getNotifications();
      setNotifications(items);
    });
    // Re-check every 5 minutes so the badge stays fresh during a long session.
    const interval = setInterval(() => {
      startTransition(async () => {
        const items = await getNotifications();
        setNotifications(items);
      });
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          sideOffset={8}
          className="glass z-50 w-96 rounded-xl p-0 shadow-glass animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <span className="text-sm font-semibold">Notifications</span>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-primary hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto scrollbar-thin">
            {isPending && notifications.length === 0 && (
              <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Checking renewals…
              </div>
            )}

            {!isPending && notifications.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                You&apos;re all caught up. Nothing needs attention right now.
              </div>
            )}

            {notifications.map((n) => {
              const isRead = readIds.includes(n.id);
              return (
                <div
                  key={n.id}
                  className={cn(
                    "group flex items-start gap-3 border-b border-border/40 px-4 py-3 last:border-0",
                    !isRead && "bg-primary/5"
                  )}
                >
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", urgencyDot[n.urgency])} />
                  <Link
                    href={n.assetId ? `/assets?assetId=${n.assetId}` : "/assets"}
                    onClick={() => markAsRead(n.id)}
                    className="flex-1"
                  >
                    <p className={cn("text-sm", !isRead && "font-medium")}>{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                  </Link>
                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!isRead && (
                      <button
                        title="Mark as read"
                        onClick={() => markAsRead(n.id)}
                        className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Check className="size-3.5" />
                      </button>
                    )}
                    <button
                      title="Dismiss"
                      onClick={() => dismissNotification(n.id)}
                      className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
