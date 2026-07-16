"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { DEFAULT_CATEGORIES } from "./constants";

/**
 * Ensures a new user has the default category set. Safe to call on every
 * assets-page load — it's a no-op after the first call because of the
 * (userId, slug) unique constraint + skipDuplicates.
 */
export async function ensureDefaultCategories() {
  const session = await requireSession();
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: session.user.id, isSystem: true })),
    skipDuplicates: true,
  });
}

export async function getCategories() {
  const session = await requireSession();
  await ensureDefaultCategories();
  return prisma.category.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(name: string, color?: string) {
  const session = await requireSession();
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return prisma.category.create({
    data: { userId: session.user.id, name, slug, color: color ?? "#6366f1" },
  });
}
