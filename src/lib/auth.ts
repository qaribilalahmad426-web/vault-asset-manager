import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

/**
 * Auth: Better Auth
 *
 * Why Better Auth over Auth.js / Clerk for this project:
 * - Auth.js (NextAuth) is battle-tested but its session/adapter model is
 *   awkward with Server Actions and typed Prisma models; Better Auth was
 *   built specifically for the App Router + Server Actions pattern used
 *   throughout this app.
 * - Clerk is excellent but is a hosted, closed identity provider — it puts
 *   user data (and eventually billing metadata) on a third party. This is a
 *   personal finance/asset tool; keeping auth data in the same Postgres
 *   database as everything else (and self-hostable) matches the privacy
 *   posture the rest of the app takes with encrypted secrets.
 * - Better Auth is fully open-source, typed end-to-end, and its Prisma
 *   adapter maps 1:1 onto the User/Session/Account/Verification models
 *   already in schema.prisma — no separate auth database or vendor lock-in.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh once per day of activity
  },
  user: {
    additionalFields: {},
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
});

export type Session = typeof auth.$Infer.Session;
