import { z } from "zod";
import type { Prisma } from "@prisma/client";

export const billingCycleEnum = z.enum([
  "MONTHLY",
  "YEARLY",
  "LIFETIME",
  "TRIAL",
  "FREE",
  "ONE_TIME",
  "CUSTOM",
]);

export const assetStatusEnum = z.enum(["ACTIVE", "TRIAL", "EXPIRED", "CANCELLED", "ARCHIVED"]);

export const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

/**
 * Single source of truth for asset validation. Used by the create/edit form
 * (client) and the server action (server) so the rules can never drift.
 */
export const assetFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  logoUrl: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  categoryId: z.string().trim().optional().or(z.literal("")),
  vendor: z.string().trim().max(120).optional().or(z.literal("")),
  websiteUrl: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
  billingUrl: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
  dashboardUrl: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
  planName: z.string().trim().max(120).optional().or(z.literal("")),

  status: assetStatusEnum.default("ACTIVE"),
  billingCycle: billingCycleEnum.default("MONTHLY"),
  purchaseDate: z.string().trim().optional().or(z.literal("")),
  startDate: z.string().trim().optional().or(z.literal("")),
  renewalDate: z.string().trim().optional().or(z.literal("")),
  expirationDate: z.string().trim().optional().or(z.literal("")),
  autoRenew: z.boolean().default(true),

  price: z.coerce.number().min(0, "Price cannot be negative").default(0),
  currency: z.string().trim().length(3).default("USD"),

  paymentMethod: z.string().trim().max(80).optional().or(z.literal("")),
  invoiceNumber: z.string().trim().max(80).optional().or(z.literal("")),
  purchasedFrom: z.string().trim().max(120).optional().or(z.literal("")),
  orderId: z.string().trim().max(120).optional().or(z.literal("")),

  licenseKey: z.string().trim().max(4000).optional().or(z.literal("")),
  apiKey: z.string().trim().max(4000).optional().or(z.literal("")),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),

  emailUsed: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  username: z.string().trim().max(120).optional().or(z.literal("")),
  twoFactorEnabled: z.boolean().default(false),
  recoveryEmail: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),

  tags: z.array(z.string().trim().min(1)).default([]),
  priority: priorityEnum.default("MEDIUM"),
  isFavorite: z.boolean().default(false),
});

export type AssetFormValues = z.infer<typeof assetFormSchema>;

export const assetFilterSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  status: assetStatusEnum.optional(),
  priority: priorityEnum.optional(),
  favoritesOnly: z.boolean().optional(),
  sort: z
    .enum(["newest", "oldest", "cost_high", "cost_low", "renewal_soon", "alphabetical", "updated"])
    .default("renewal_soon"),
});

export type AssetFilterValues = z.infer<typeof assetFilterSchema>;

/**
 * The shape of an asset as returned by list/detail queries (includes its
 * category relation). Lives here — not in actions.ts — because files with
 * a top-level "use server" directive may only export async functions;
 * Next.js's server-action compiler rejects type/const/interface exports
 * from those files even though TypeScript erases them at compile time.
 */
export type AssetListItem = Prisma.AssetGetPayload<{ include: { category: true } }>;
