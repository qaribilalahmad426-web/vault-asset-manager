"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const DEFAULT_CATEGORIES: { name: string; slug: string; icon: string; color: string }[] = [
  { name: "AI Tools", slug: "ai-tools", icon: "sparkles", color: "#6366f1" },
  { name: "LLMs", slug: "llms", icon: "brain", color: "#8b5cf6" },
  { name: "Image Generation", slug: "image-generation", icon: "image", color: "#ec4899" },
  { name: "Video Tools", slug: "video-tools", icon: "video", color: "#f43f5e" },
  { name: "Voice AI", slug: "voice-ai", icon: "mic", color: "#f97316" },
  { name: "Hosting", slug: "hosting", icon: "server", color: "#0ea5e9" },
  { name: "Domains", slug: "domains", icon: "globe", color: "#14b8a6" },
  { name: "Developer Tools", slug: "developer-tools", icon: "code", color: "#22c55e" },
  { name: "Productivity", slug: "productivity", icon: "check-square", color: "#84cc16" },
  { name: "Design", slug: "design", icon: "palette", color: "#a855f7" },
  { name: "SEO", slug: "seo", icon: "trending-up", color: "#eab308" },
  { name: "Analytics", slug: "analytics", icon: "bar-chart", color: "#06b6d4" },
  { name: "Marketing", slug: "marketing", icon: "megaphone", color: "#f59e0b" },
  { name: "Automation", slug: "automation", icon: "workflow", color: "#6366f1" },
  { name: "Cloud & Storage", slug: "cloud-storage", icon: "cloud", color: "#3b82f6" },
  { name: "SaaS", slug: "saas", icon: "layout-grid", color: "#64748b" },
];

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
