"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function getNotificationPreferences() {
  const session = await requireSession();
  const existing = await prisma.notificationPreference.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) return existing;

  return prisma.notificationPreference.create({
    data: { userId: session.user.id },
  });
}

export async function updateNotificationPreferences(patch: {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  browserEnabled: boolean;
  defaultReminderDays: number[];
}) {
  const session = await requireSession();
  const updated = await prisma.notificationPreference.upsert({
    where: { userId: session.user.id },
    update: patch,
    create: { userId: session.user.id, ...patch },
  });
  revalidatePath("/settings");
  return updated;
}
