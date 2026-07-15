import { create } from "zustand";
import type { NotificationItem } from "@/types";

type ViewMode = "table" | "grid";

export interface AssetFilters {
  search: string;
  categoryId: string; // "all" or a Category.id
  status: string; // "all" or an AssetStatus
  sort: string;
}

const defaultAssetFilters: AssetFilters = {
  search: "",
  categoryId: "all",
  status: "all",
  sort: "renewal_soon",
};

interface UiState {
  // Layout
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Asset filters — shared across the assets list and any future page
  // (dashboard "view all" links, calendar day-click, global search) so
  // navigating between them doesn't reset what the user was looking at.
  assetFilters: AssetFilters;
  setAssetFilters: (patch: Partial<AssetFilters>) => void;
  resetAssetFilters: () => void;

  // Notifications — computed server-side on load, then layered with
  // client-only read/dismissed state so marking something read doesn't
  // require a round trip or a schema migration (see Phase 3 in ROADMAP.md
  // for a persisted version of this).
  notifications: NotificationItem[];
  readIds: string[];
  dismissedIds: string[];
  setNotifications: (items: NotificationItem[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  viewMode: "table",
  setViewMode: (mode) => set({ viewMode: mode }),

  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  assetFilters: defaultAssetFilters,
  setAssetFilters: (patch) => set((s) => ({ assetFilters: { ...s.assetFilters, ...patch } })),
  resetAssetFilters: () => set({ assetFilters: defaultAssetFilters }),

  notifications: [],
  readIds: [],
  dismissedIds: [],
  setNotifications: (items) => {
    const knownIds = new Set(items.map((n) => n.id));
    set((s) => ({
      notifications: items,
      // Drop stale read/dismissed ids for notifications that no longer exist
      // (e.g. the asset was renewed or deleted) so the lists don't grow forever.
      readIds: s.readIds.filter((id) => knownIds.has(id)),
      dismissedIds: s.dismissedIds.filter((id) => knownIds.has(id)),
    }));
  },
  markAsRead: (id) => set((s) => ({ readIds: s.readIds.includes(id) ? s.readIds : [...s.readIds, id] })),
  markAllAsRead: () =>
    set((s) => ({ readIds: Array.from(new Set([...s.readIds, ...s.notifications.map((n) => n.id)])) })),
  dismissNotification: (id) =>
    set((s) => ({ dismissedIds: [...s.dismissedIds, id], readIds: [...s.readIds, id] })),
}));

/** Derived helper: visible (non-dismissed) notifications, unread-first. */
export function selectVisibleNotifications(state: UiState) {
  return state.notifications.filter((n) => !state.dismissedIds.includes(n.id));
}

export function selectUnreadCount(state: UiState) {
  return state.notifications.filter(
    (n) => !state.dismissedIds.includes(n.id) && !state.readIds.includes(n.id)
  ).length;
}
