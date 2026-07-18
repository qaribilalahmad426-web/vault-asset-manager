/**
 * Auth-free session shim.
 * Better-auth has been removed. All actions now run without user isolation.
 * This file exists only for backward-compatibility with any remaining import.
 */
export async function getSession() {
  return null;
}

export async function requireSession() {
  return null;
}
