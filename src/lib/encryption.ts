import crypto from "crypto";

/**
 * Field-level encryption for secrets (API keys, license keys, sensitive
 * notes) using AES-256-GCM.
 *
 * - Requires ENCRYPTION_KEY: a 32-byte key, base64-encoded, in the
 *   environment. Generate one with `openssl rand -base64 32`.
 * - Each value gets a fresh random IV; the IV and auth tag are stored
 *   alongside the ciphertext (all base64) so a single string round-trips.
 * - Never log or return decrypted values except to the authenticated owner.
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      "ENCRYPTION_KEY is not set. Generate one with `openssl rand -base64 32` and add it to .env"
    );
  }
  const buffer = Buffer.from(key, "base64");
  if (buffer.length !== 32) {
    throw new Error("ENCRYPTION_KEY must decode to exactly 32 bytes.");
  }
  return buffer;
}

/** Encrypts plaintext into a single "iv:tag:ciphertext" base64 payload. */
export function encryptSecret(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(":");
}

/** Reverses encryptSecret. Throws if the payload has been tampered with. */
export function decryptSecret(payload: string): string {
  const key = getKey();
  const [ivB64, tagB64, dataB64] = payload.split(":");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Malformed encrypted payload.");
  }

  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
}

/** Masks a decrypted secret for display, e.g. "sk-••••••••ab12". */
export function maskSecret(plaintext: string, visibleTail = 4): string {
  if (plaintext.length <= visibleTail) return "•".repeat(plaintext.length);
  return `${"•".repeat(Math.max(plaintext.length - visibleTail, 4))}${plaintext.slice(-visibleTail)}`;
}
