"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { daysUntil } from "@/lib/utils";

/** Normalizes any billing cycle + price into an equivalent monthly cost. */
function toMonthlyCents(priceCents: number | null, cycle: string): number {
  if (!priceCents) return 0;
  switch (cycle) {
    case "YEARLY":
      return priceCents / 12;
    case "LIFETIME":
    case "ONE_TIME":
    case "FREE":
    case "TRIAL":
      return 0;
    default:
      return priceCents;
  }
}

export async function getDashboardStats() {
  const session = await requireSession();
  const userId = session.user.id;

  const assets = await prisma.asset.findMany({
    where: { userId, isHidden: false },
    include: { category: true },
  });

  const active = assets.filter((a) => a.status === "ACTIVE" || a.status === "TRIAL");
  const expired = assets.filter((a) => a.status === "EXPIRED");

  const renewingThisWeek = active.filter((a) => {
    const d = daysUntil(a.renewalDate);
    return d !== null && d >= 0 && d <= 7;
  });
  const renewingThisMonth = active.filter((a) => {
    const d = daysUntil(a.renewalDate);
    return d !== null && d >= 0 && d <= 30;
  });

  const monthlySpendCents = active.reduce(
    (sum, a) => sum + toMonthlyCents(a.priceCents, a.billingCycle),
    0
  );
  const yearlySpendCents = monthlySpendCents * 12;
  const averageMonthlyCostCents = active.length ? monthlySpendCents / active.length : 0;

  const credits = await prisma.creditBalance.findMany({
    where: { asset: { userId } },
  });
  const totalCreditsRemaining = credits.reduce(
    (sum, c) => sum + Math.max(c.totalCredits - c.usedCredits, 0),
    0
  );

  // Heuristic for "unused": active, non-favorite, never opened via dashboard
  // in the last 30 days according to activity log — a real usage signal is
  // wired in Phase 5's AI module; for now we flag by favorite+priority as a
  // stand-in signal so the card is meaningful rather than fake.
  const potentiallyUnused = active.filter(
    (a) => !a.isFavorite && a.priority === "LOW" && a.priceCents && a.priceCents > 0
  );

  const recentlyAdded = [...assets]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const upcomingRenewals = [...active]
    .filter((a) => a.renewalDate)
    .sort((a, b) => (a.renewalDate?.getTime() ?? 0) - (b.renewalDate?.getTime() ?? 0))
    .slice(0, 6);

  return {
    totalActiveAssets: active.length,
    expiredAssets: expired.length,
    renewingThisWeek: renewingThisWeek.length,
    renewingThisMonth: renewingThisMonth.length,
    monthlySpendCents,
    yearlySpendCents,
    averageMonthlyCostCents,
    totalLicenses: assets.filter((a) => a.licenseKeyEncrypted).length,
    totalCreditsRemaining,
    unusedSubscriptions: potentiallyUnused.length,
    recentlyAdded,
    upcomingRenewals,
  };
}

export interface CalendarFeedItem {
  id: string;
  name: string;
  date: string; // ISO date — renewalDate, falling back to expirationDate
  dateType: "renewal" | "expiration";
  priceCents: number | null;
  currency: string;
  emailUsed: string | null;
  billingUrl: string | null;
  websiteUrl: string | null;
  status: string;
}

/**
 * Lightweight feed for the renewal calendar — only the fields the calendar
 * and its day-detail popover actually render, so the client payload stays
 * small even with a large asset library.
 */
export async function getCalendarFeed(): Promise<CalendarFeedItem[]> {
  const session = await requireSession();

  const assets = await prisma.asset.findMany({
    where: {
      userId: session.user.id,
      isHidden: false,
      status: { in: ["ACTIVE", "TRIAL"] },
      OR: [{ renewalDate: { not: null } }, { expirationDate: { not: null } }],
    },
    select: {
      id: true,
      name: true,
      renewalDate: true,
      expirationDate: true,
      priceCents: true,
      currency: true,
      emailUsed: true,
      billingUrl: true,
      websiteUrl: true,
      status: true,
    },
  });

  return assets.map((asset) => {
    const date = asset.renewalDate ?? asset.expirationDate!;
    return {
      id: asset.id,
      name: asset.name,
      date: date.toISOString(),
      dateType: asset.renewalDate ? "renewal" : "expiration",
      priceCents: asset.priceCents,
      currency: asset.currency,
      emailUsed: asset.emailUsed,
      billingUrl: asset.billingUrl,
      websiteUrl: asset.websiteUrl,
      status: asset.status,
    };
  });
}
