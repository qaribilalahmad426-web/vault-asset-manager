export type NotificationUrgency = "safe" | "upcoming" | "soon" | "urgent" | "expired";

export type NotificationType = "RENEWAL" | "EXPIRY" | "CREDIT_RESET" | "TRIAL_ENDING";

/**
 * A computed (not persisted) notification. These are derived fresh from
 * asset/credit dates on every load — read/dismissed state lives client-side
 * in the UI store. See ROADMAP.md Phase 3 for the persisted-reminder engine
 * that will eventually back this with real delivery (email/browser).
 */
export interface NotificationItem {
  id: string;
  assetId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  urgency: NotificationUrgency;
  date: string; // ISO date the notification concerns
}
