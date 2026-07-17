import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// ── Personal-use bypass ────────────────────────────────────────────────────
// Set BYPASS_AUTH=true in your .env / Vercel environment variables to skip
// the login screen entirely.  Also set ADMIN_USER_ID to your actual DB user
// ID so all queries return your data.
const BYPASS_AUTH = process.env.BYPASS_AUTH === "true";

function bypassSession() {
  return {
    user: {
      id: process.env.ADMIN_USER_ID ?? "",
      name: process.env.ADMIN_USER_NAME ?? "Admin",
      email: process.env.ADMIN_USER_EMAIL ?? "admin@vault.app",
      image: null as string | null,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    session: {
      id: "bypass",
      userId: process.env.ADMIN_USER_ID ?? "",
      token: "bypass",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: null as string | null,
      userAgent: null as string | null,
    },
  };
}
// ──────────────────────────────────────────────────────────────────────────

/** Reads the current session on the server. Returns null if unauthenticated. */
export async function getSession() {
  if (BYPASS_AUTH) return bypassSession();
  return auth.api.getSession({ headers: await headers() });
}

/** Use in Server Components / Server Actions that require a logged-in user. */
export async function requireSession() {
  if (BYPASS_AUTH) return bypassSession();
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }
  return session;
}

