/**
 * Seed script — populates realistic sample data for an existing user.
 *
 * Auth accounts are created through the normal sign-up flow (Better Auth
 * owns password hashing), so this script does NOT create a user. Sign up
 * once in the app first, then run:
 *
 *   npm run db:seed
 *
 * By default it seeds the most recently created user. Pass a specific
 * email with SEED_USER_EMAIL=you@example.com npm run db:seed.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { encryptSecret } from "../src/lib/encryption";
import { DEFAULT_CATEGORIES } from "../src/features/categories/constants";

const prisma = new PrismaClient();

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function main() {
  const email = process.env.SEED_USER_EMAIL;
  const user = email
    ? await prisma.user.findUnique({ where: { email } })
    : await prisma.user.findFirst({ orderBy: { createdAt: "desc" } });

  if (!user) {
    console.error(
      "No user found. Sign up in the app first (npm run dev -> /sign-up), then re-run `npm run db:seed`."
    );
    process.exit(1);
  }

  console.log(`Seeding sample data for ${user.email}...`);

  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: user.id, isSystem: true })),
    skipDuplicates: true,
  });
  const categories = await prisma.category.findMany({ where: { userId: user.id } });
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  const sampleAssets = [
    {
      name: "ChatGPT Plus",
      vendor: "OpenAI",
      categorySlug: "llms",
      planName: "Plus",
      priceCents: 2000,
      billingCycle: "MONTHLY" as const,
      renewalInDays: 5,
      websiteUrl: "https://chat.openai.com",
      billingUrl: "https://platform.openai.com/account/billing",
      emailUsed: user.email,
      priority: "HIGH" as const,
      isFavorite: true,
      credits: { total: 10000, used: 6400, period: "MONTHLY" as const, resetInDays: 1 },
    },
    {
      name: "Midjourney",
      vendor: "Midjourney Inc.",
      categorySlug: "image-generation",
      planName: "Standard",
      priceCents: 3000,
      billingCycle: "MONTHLY" as const,
      renewalInDays: 12,
      websiteUrl: "https://midjourney.com",
      emailUsed: user.email,
      priority: "MEDIUM" as const,
    },
    {
      name: "Vercel Pro",
      vendor: "Vercel",
      categorySlug: "hosting",
      planName: "Pro",
      priceCents: 2000,
      billingCycle: "MONTHLY" as const,
      renewalInDays: 24,
      websiteUrl: "https://vercel.com",
      emailUsed: user.email,
      priority: "HIGH" as const,
    },
    {
      name: "namecheap.com",
      vendor: "Namecheap",
      categorySlug: "domains",
      planName: "Domain registration",
      priceCents: 1499,
      billingCycle: "YEARLY" as const,
      renewalInDays: 200,
      websiteUrl: "https://namecheap.com",
      emailUsed: user.email,
      priority: "LOW" as const,
    },
    {
      name: "ElevenLabs",
      vendor: "ElevenLabs",
      categorySlug: "voice-ai",
      planName: "Creator",
      priceCents: 2200,
      billingCycle: "MONTHLY" as const,
      renewalInDays: 2,
      websiteUrl: "https://elevenlabs.io",
      emailUsed: user.email,
      priority: "MEDIUM" as const,
      apiKey: "sk_demo_1234567890abcdef",
      credits: { total: 30000, used: 28500, period: "MONTHLY" as const, resetInDays: 2 },
    },
    {
      name: "Notion AI",
      vendor: "Notion Labs",
      categorySlug: "productivity",
      planName: "Plus",
      priceCents: 1000,
      billingCycle: "MONTHLY" as const,
      renewalInDays: 45,
      websiteUrl: "https://notion.so",
      emailUsed: user.email,
      priority: "LOW" as const,
      isFavorite: false,
    },
    {
      name: "Old A/B testing tool",
      vendor: "Split.io",
      categorySlug: "analytics",
      planName: "Starter",
      priceCents: 4900,
      billingCycle: "MONTHLY" as const,
      renewalInDays: 9,
      emailUsed: user.email,
      priority: "LOW" as const,
      status: "ACTIVE" as const,
    },
    {
      name: "Framer",
      vendor: "Framer BV",
      categorySlug: "design",
      planName: "Pro trial",
      priceCents: 0,
      billingCycle: "TRIAL" as const,
      status: "TRIAL" as const,
      renewalInDays: 6,
      expirationInDays: 6,
      emailUsed: user.email,
      priority: "MEDIUM" as const,
    },
  ];

  for (const sample of sampleAssets) {
    const asset = await prisma.asset.create({
      data: {
        userId: user.id,
        categoryId: categoryBySlug.get(sample.categorySlug) ?? null,
        name: sample.name,
        vendor: sample.vendor,
        planName: sample.planName,
        priceCents: sample.priceCents,
        currency: "USD",
        billingCycle: sample.billingCycle,
        status: sample.status ?? "ACTIVE",
        renewalDate: sample.renewalInDays !== undefined ? daysFromNow(sample.renewalInDays) : null,
        expirationDate:
          sample.expirationInDays !== undefined ? daysFromNow(sample.expirationInDays) : null,
        purchaseDate: daysFromNow(-90),
        startDate: daysFromNow(-90),
        autoRenew: true,
        websiteUrl: sample.websiteUrl,
        billingUrl: sample.billingUrl,
        emailUsed: sample.emailUsed,
        priority: sample.priority,
        isFavorite: sample.isFavorite ?? false,
        apiKeyEncrypted: sample.apiKey ? encryptSecret(sample.apiKey) : null,
        tags: [sample.categorySlug],
      },
    });

    if (sample.credits) {
      await prisma.creditBalance.create({
        data: {
          assetId: asset.id,
          period: sample.credits.period,
          totalCredits: sample.credits.total,
          usedCredits: sample.credits.used,
          resetsAt: daysFromNow(sample.credits.resetInDays),
          lastResetAt: daysFromNow(sample.credits.resetInDays - 30),
        },
      });
    }
  }

  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  console.log(`Seeded ${sampleAssets.length} sample assets for ${user.email}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
