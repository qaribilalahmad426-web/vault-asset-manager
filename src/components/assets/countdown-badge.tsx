import { Badge } from "@/components/ui/badge";
import { daysUntil, getExpiryUrgency } from "@/lib/utils";

const urgencyToVariant = {
  safe: "success",
  upcoming: "secondary",
  soon: "warning",
  urgent: "destructive",
  expired: "outline",
} as const;

export function CountdownBadge({ date }: { date: Date | string | null | undefined }) {
  const days = daysUntil(date);
  const urgency = getExpiryUrgency(days);

  if (days === null) {
    return <Badge variant="secondary">No date</Badge>;
  }

  const label =
    days < 0
      ? `Expired ${Math.abs(days)}d ago`
      : days === 0
      ? "Due today"
      : `${days}d left`;

  return <Badge variant={urgencyToVariant[urgency]}>{label}</Badge>;
}
