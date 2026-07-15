import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Reads the current session on the server. Returns null if unauthenticated. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Use in Server Components / Server Actions that require a logged-in user. */
export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }
  return session;
}
