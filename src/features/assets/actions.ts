"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { encryptSecret } from "@/lib/encryption";
import { assetFilterSchema, assetFormSchema, type AssetFormValues } from "./schema";
import type { Prisma } from "@prisma/client";

// For write operations (create/duplicate) we still need a userId because the
// schema requires it.  ADMIN_USER_ID is the single owner of all records.
// For read operations we query all records without any userId filter.
const OWNER_ID = process.env.ADMIN_USER_ID ?? "default-owner";

function toDate(value: string | undefined | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toCents(price: number) {
  return Math.round(price * 100);
}

export async function createAsset(input: AssetFormValues) {
  const data = assetFormSchema.parse(input);

  const asset = await prisma.asset.create({
    data: {
      userId: OWNER_ID,
      name: data.name,
      logoUrl: data.logoUrl || null,
      description: data.description || null,
      categoryId: data.categoryId || null,
      vendor: data.vendor || null,
      websiteUrl: data.websiteUrl || null,
      billingUrl: data.billingUrl || null,
      dashboardUrl: data.dashboardUrl || null,
      planName: data.planName || null,
      status: data.status,
      billingCycle: data.billingCycle,
      purchaseDate: toDate(data.purchaseDate),
      startDate: toDate(data.startDate),
      renewalDate: toDate(data.renewalDate),
      expirationDate: toDate(data.expirationDate),
      autoRenew: data.autoRenew,
      priceCents: toCents(data.price),
      currency: data.currency,
      paymentMethod: data.paymentMethod || null,
      invoiceNumber: data.invoiceNumber || null,
      purchasedFrom: data.purchasedFrom || null,
      orderId: data.orderId || null,
      licenseKeyEncrypted: data.licenseKey ? encryptSecret(data.licenseKey) : null,
      apiKeyEncrypted: data.apiKey ? encryptSecret(data.apiKey) : null,
      notesEncrypted: data.notes ? encryptSecret(data.notes) : null,
      emailUsed: data.emailUsed || null,
      username: data.username || null,
      twoFactorEnabled: data.twoFactorEnabled,
      recoveryEmail: data.recoveryEmail || null,
      tags: data.tags,
      priority: data.priority,
      isFavorite: data.isFavorite,
    },
  });

  await prisma.activityLog.create({
    data: { userId: OWNER_ID, assetId: asset.id, action: "CREATED" },
  });

  revalidatePath("/dashboard");
  revalidatePath("/assets");
  return asset;
}

export async function updateAsset(assetId: string, input: AssetFormValues) {
  const data = assetFormSchema.parse(input);

  const existing = await prisma.asset.findFirst({ where: { id: assetId } });
  if (!existing) throw new Error("Asset not found");

  const asset = await prisma.asset.update({
    where: { id: assetId },
    data: {
      name: data.name,
      logoUrl: data.logoUrl || null,
      description: data.description || null,
      categoryId: data.categoryId || null,
      vendor: data.vendor || null,
      websiteUrl: data.websiteUrl || null,
      billingUrl: data.billingUrl || null,
      dashboardUrl: data.dashboardUrl || null,
      planName: data.planName || null,
      status: data.status,
      billingCycle: data.billingCycle,
      purchaseDate: toDate(data.purchaseDate),
      startDate: toDate(data.startDate),
      renewalDate: toDate(data.renewalDate),
      expirationDate: toDate(data.expirationDate),
      autoRenew: data.autoRenew,
      priceCents: toCents(data.price),
      currency: data.currency,
      paymentMethod: data.paymentMethod || null,
      invoiceNumber: data.invoiceNumber || null,
      purchasedFrom: data.purchasedFrom || null,
      orderId: data.orderId || null,
      ...(data.licenseKey ? { licenseKeyEncrypted: encryptSecret(data.licenseKey) } : {}),
      ...(data.apiKey ? { apiKeyEncrypted: encryptSecret(data.apiKey) } : {}),
      ...(data.notes ? { notesEncrypted: encryptSecret(data.notes) } : {}),
      emailUsed: data.emailUsed || null,
      username: data.username || null,
      twoFactorEnabled: data.twoFactorEnabled,
      recoveryEmail: data.recoveryEmail || null,
      tags: data.tags,
      priority: data.priority,
      isFavorite: data.isFavorite,
    },
  });

  await prisma.activityLog.create({
    data: { userId: OWNER_ID, assetId: asset.id, action: "UPDATED" },
  });

  revalidatePath("/dashboard");
  revalidatePath("/assets");
  return asset;
}

export async function deleteAsset(assetId: string) {
  await prisma.asset.delete({ where: { id: assetId } });
  revalidatePath("/dashboard");
  revalidatePath("/assets");
}

export async function archiveAsset(assetId: string) {
  await prisma.asset.update({ where: { id: assetId }, data: { status: "ARCHIVED" } });
  await prisma.activityLog.create({
    data: { userId: OWNER_ID, assetId, action: "ARCHIVED" },
  });
  revalidatePath("/dashboard");
  revalidatePath("/assets");
}

export async function toggleFavorite(assetId: string) {
  const asset = await prisma.asset.findFirst({ where: { id: assetId } });
  if (!asset) throw new Error("Asset not found");
  const updated = await prisma.asset.update({
    where: { id: assetId },
    data: { isFavorite: !asset.isFavorite },
  });
  revalidatePath("/dashboard");
  revalidatePath("/assets");
  return updated;
}

export async function duplicateAsset(assetId: string) {
  const asset = await prisma.asset.findFirst({ where: { id: assetId } });
  if (!asset) throw new Error("Asset not found");

  const copy = await prisma.asset.create({
    data: {
      userId: OWNER_ID,
      categoryId: asset.categoryId,
      name: `${asset.name} (copy)`,
      logoUrl: asset.logoUrl,
      description: asset.description,
      vendor: asset.vendor,
      websiteUrl: asset.websiteUrl,
      billingUrl: asset.billingUrl,
      dashboardUrl: asset.dashboardUrl,
      planName: asset.planName,
      status: asset.status,
      billingCycle: asset.billingCycle,
      purchaseDate: asset.purchaseDate,
      startDate: asset.startDate,
      renewalDate: asset.renewalDate,
      expirationDate: asset.expirationDate,
      autoRenew: asset.autoRenew,
      priceCents: asset.priceCents,
      currency: asset.currency,
      paymentMethod: asset.paymentMethod,
      invoiceNumber: asset.invoiceNumber,
      purchasedFrom: asset.purchasedFrom,
      orderId: asset.orderId,
      licenseKeyEncrypted: asset.licenseKeyEncrypted,
      apiKeyEncrypted: asset.apiKeyEncrypted,
      notesEncrypted: asset.notesEncrypted,
      emailUsed: asset.emailUsed,
      username: asset.username,
      twoFactorEnabled: asset.twoFactorEnabled,
      recoveryEmail: asset.recoveryEmail,
      tags: asset.tags,
      priority: asset.priority,
      isFavorite: false,
    },
  });

  await prisma.activityLog.create({
    data: { userId: OWNER_ID, assetId: copy.id, action: "CREATED" },
  });

  revalidatePath("/assets");
  return copy;
}

export async function getAssets(
  rawFilters: Partial<Prisma.AssetWhereInput> & Record<string, unknown> = {}
) {
  const filters = assetFilterSchema.parse(rawFilters);

  const where: Prisma.AssetWhereInput = {
    isHidden: false,
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(filters.favoritesOnly ? { isFavorite: true } : {}),
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { vendor: { contains: filters.search, mode: "insensitive" } },
            { tags: { has: filters.search } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.AssetOrderByWithRelationInput =
    filters.sort === "newest"
      ? { createdAt: "desc" }
      : filters.sort === "oldest"
      ? { createdAt: "asc" }
      : filters.sort === "cost_high"
      ? { priceCents: "desc" }
      : filters.sort === "cost_low"
      ? { priceCents: "asc" }
      : filters.sort === "alphabetical"
      ? { name: "asc" }
      : filters.sort === "updated"
      ? { updatedAt: "desc" }
      : { renewalDate: "asc" };

  return prisma.asset.findMany({ where, orderBy, include: { category: true } });
}

export async function getAssetById(assetId: string) {
  return prisma.asset.findFirst({
    where: { id: assetId },
    include: { category: true, credits: true, attachments: true, customFields: true },
  });
}

export async function revealAssetSecret(
  assetId: string,
  field: "licenseKey" | "apiKey" | "notes"
) {
  const asset = await prisma.asset.findFirst({ where: { id: assetId } });
  if (!asset) return null;

  const columnMap = {
    licenseKey: asset.licenseKeyEncrypted,
    apiKey: asset.apiKeyEncrypted,
    notes: asset.notesEncrypted,
  } as const;

  const ciphertext = columnMap[field];
  if (!ciphertext) return null;

  const { decryptSecret } = await import("@/lib/encryption");
  return decryptSecret(ciphertext);
}
