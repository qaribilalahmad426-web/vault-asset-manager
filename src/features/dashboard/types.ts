export interface CalendarFeedItem {
  id: string;
  name: string;
  date: string; // ISO date — renewalDate, falling back to expirationDate
  dateType: "renewal" | "expiration";
  priceCents: number | null;
  currency: string;
  emailUsed: string | null;
  billingUrl: string | null;
  websiteUrl: string | null;
  status: string;
}
