"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const OWNER_ID = process.env.ADMIN_USER_ID ?? "default-owner";

export async function getNotificationPreferences() {
  const existing = await prisma.notificationPreference.findFirst();
  if (existing) return existing;

  return prisma.notificationPreference.create({
    data: { userId: OWNER_ID },
  });
}

export async function updateNotificationPreferences(patch: {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  browserEnabled: boolean;
  defaultReminderDays: number[];
}) {
  const existing = await prisma.notificationPreference.findFirst();

  const updated = existing
    ? await prisma.notificationPreference.update({ where: { id: existing.id }, data: patch })
    : await prisma.notificationPreference.create({ data: { userId: OWNER_ID, ...patch } });

  revalidatePath("/settings");
  return updated;
}
