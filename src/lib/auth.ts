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
function createAuth() {
  return betterAuth({
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
}

type AuthInstance = ReturnType<typeof createAuth>;

// Next.js imports this module while statically analyzing routes during
// `next build` ("collecting page data"), which can happen before runtime
// environment variables are guaranteed to be populated in some CI/deploy
// setups. Calling betterAuth() eagerly at module scope would run that
// construction — and any env-dependent validation inside it — during that
// build-time analysis instead of at actual request time.
//
// This Proxy defers construction to the first real property access (i.e.
// the first actual request or server action call), while every existing
// call site (`auth.api.getSession(...)`, `toNextJsHandler(auth)`) keeps
// working completely unchanged. No secrets are defaulted or weakened here —
// construction just happens lazily instead of at import time.
let cachedAuth: AuthInstance | undefined;

function getAuthInstance(): AuthInstance {
  if (!cachedAuth) {
    cachedAuth = createAuth();
  }
  return cachedAuth;
}

export const auth: AuthInstance = new Proxy({} as AuthInstance, {
  get(_target, prop) {
    const instance = getAuthInstance();
    return Reflect.get(instance as object, prop, instance);
  },
  has(_target, prop) {
    return Reflect.has(getAuthInstance() as object, prop);
  },
});

export type Session = AuthInstance["$Infer"]["Session"];
