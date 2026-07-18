"use server";

import { prisma } from "@/lib/prisma";
import { daysUntil, getExpiryUrgency, formatMoney } from "@/lib/utils";
import type { NotificationItem } from "@/types";

function relativeDay(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  if (days > 1) return `in ${days} days`;
  return `${Math.abs(days)} days ago`;
}

/**
 * Computes the current notification set by scanning live asset/credit data.
 * No user session required — queries all records.
 */
export async function getNotifications(): Promise<NotificationItem[]> {
  const notifications: NotificationItem[] = [];

  const assets = await prisma.asset.findMany({
    where: {
      isHidden: false,
      status: { in: ["ACTIVE", "TRIAL"] },
    },
    select: {
      id: true,
      name: true,
      renewalDate: true,
      expirationDate: true,
      status: true,
      priceCents: true,
      currency: true,
    },
  });

  for (const asset of assets) {
    const renewalDays = daysUntil(asset.renewalDate);
    if (renewalDays !== null && renewalDays <= 30 && renewalDays >= -1) {
      const price = formatMoney(asset.priceCents ?? 0, asset.currency);
      notifications.push({
        id: `renewal:${asset.id}`,
        assetId: asset.id,
        type: "RENEWAL",
        title: `${asset.name} renews ${relativeDay(renewalDays)}`,
        message: `${price} will be charged ${relativeDay(renewalDays)}.`,
        urgency: getExpiryUrgency(renewalDays),
        date: asset.renewalDate!.toISOString(),
      });
    }

    const expiryDays = daysUntil(asset.expirationDate);
    if (asset.status === "TRIAL" && expiryDays !== null && expiryDays <= 7 && expiryDays >= -1) {
      notifications.push({
        id: `trial:${asset.id}`,
        assetId: asset.id,
        type: "TRIAL_ENDING",
        title: `${asset.name} trial ends ${relativeDay(expiryDays)}`,
        message: `Decide whether to keep or cancel before it converts.`,
        urgency: getExpiryUrgency(expiryDays),
        date: asset.expirationDate!.toISOString(),
      });
    }
  }

  const creditBalances = await prisma.creditBalance.findMany({
    where: { asset: { isHidden: false } },
    include: { asset: { select: { id: true, name: true } } },
  });

  for (const credit of creditBalances) {
    const resetDays = daysUntil(credit.resetsAt);
    if (resetDays !== null && resetDays <= 3 && resetDays >= -1) {
      const remaining = Math.max(credit.totalCredits - credit.usedCredits, 0);
      notifications.push({
        id: `credit:${credit.id}`,
        assetId: credit.asset.id,
        type: "CREDIT_RESET",
        title: `${credit.asset.name} credits reset ${relativeDay(resetDays)}`,
        message: `${remaining.toLocaleString()} of ${credit.totalCredits.toLocaleString()} credits remaining before reset.`,
        urgency: getExpiryUrgency(resetDays),
        date: credit.resetsAt!.toISOString(),
      });
    }
  }

  return notifications.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
