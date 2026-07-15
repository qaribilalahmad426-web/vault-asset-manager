import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats integer minor units (cents) into a localized currency string. */
export function formatMoney(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** Returns the number of whole days between now and a target date (can be negative). */
export function daysUntil(date: Date | string | null | undefined): number | null {
  if (!date) return null;
  const target = new Date(date);
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((target.getTime() - now.getTime()) / msPerDay);
}

export type ExpiryUrgency = "safe" | "upcoming" | "soon" | "urgent" | "expired";

/** Maps days-remaining to the semantic urgency bucket used for countdown colors. */
export function getExpiryUrgency(daysRemaining: number | null): ExpiryUrgency {
  if (daysRemaining === null) return "safe";
  if (daysRemaining < 0) return "expired";
  if (daysRemaining <= 3) return "urgent";
  if (daysRemaining <= 7) return "soon";
  if (daysRemaining <= 30) return "upcoming";
  return "safe";
}

export const urgencyColorMap: Record<ExpiryUrgency, string> = {
  safe: "text-success",
  upcoming: "text-warning",
  soon: "text-orange-500",
  urgent: "text-destructive",
  expired: "text-muted-foreground",
};

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
