import Link from "next/link";
export const dynamic = "force-dynamic";

import {
  Boxes,
  AlertTriangle,
  CalendarClock,
  Wallet,
  KeyRound,
  Sparkles,
  TrendingDown,
  Clock,
} from "lucide-react";
import { getDashboardStats, getCalendarFeed } from "@/features/dashboard/actions";
import { StatCard } from "@/components/dashboard/stat-card";
import { RenewalCalendar } from "@/components/dashboard/renewal-calendar";
import { CountdownBadge } from "@/components/assets/countdown-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils";

export default async function DashboardPage() {
  const [stats, calendarItems] = await Promise.all([getDashboardStats(), getCalendarFeed()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Everything you own, at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active assets"
          value={String(stats.totalActiveAssets)}
          icon={Boxes}
        />
        <StatCard
          label="Expired"
          value={String(stats.expiredAssets)}
          icon={AlertTriangle}
          tone={stats.expiredAssets > 0 ? "destructive" : "default"}
        />
        <StatCard
          label="Renewing this week"
          value={String(stats.renewingThisWeek)}
          icon={CalendarClock}
          tone={stats.renewingThisWeek > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Renewing this month"
          value={String(stats.renewingThisMonth)}
          icon={Clock}
        />
        <StatCard
          label="Monthly spend"
          value={formatMoney(stats.monthlySpendCents)}
          icon={Wallet}
        />
        <StatCard
          label="Yearly spend"
          value={formatMoney(stats.yearlySpendCents)}
          icon={Wallet}
        />
        <StatCard
          label="Avg. cost / asset"
          value={formatMoney(stats.averageMonthlyCostCents)}
          icon={TrendingDown}
          hint="per month"
        />
        <StatCard
          label="Stored licenses"
          value={String(stats.totalLicenses)}
          icon={KeyRound}
        />
        <StatCard
          label="Credits remaining"
          value={stats.totalCreditsRemaining.toLocaleString()}
          icon={Sparkles}
        />
        <StatCard
          label="Possibly unused"
          value={String(stats.unusedSubscriptions)}
          icon={AlertTriangle}
          tone={stats.unusedSubscriptions > 0 ? "warning" : "default"}
          hint="low priority, not favorited"
        />
      </div>

      <div id="calendar">
        <RenewalCalendar items={calendarItems} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground">
              Upcoming renewals
            </CardTitle>
            <Link href="/assets" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {stats.upcomingRenewals.length === 0 && (
              <EmptyRow message="Nothing renewing soon. Add an asset to start tracking renewals." />
            )}
            {stats.upcomingRenewals.map((asset) => (
              <Link
                key={asset.id}
                href={`/assets?assetId=${asset.id}`}
                className="flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-muted"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{asset.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {asset.vendor ?? "—"} · {formatMoney(asset.priceCents ?? 0, asset.currency)}
                  </span>
                </div>
                <CountdownBadge date={asset.renewalDate} />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground">
              Recently added
            </CardTitle>
            <Link href="/assets" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {stats.recentlyAdded.length === 0 && (
              <EmptyRow message="Your library is empty. Add your first asset to get started." />
            )}
            {stats.recentlyAdded.map((asset) => (
              <Link
                key={asset.id}
                href={`/assets?assetId=${asset.id}`}
                className="flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-muted"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{asset.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {asset.category?.name ?? "Uncategorized"}
                  </span>
                </div>
                <Badge variant="secondary">{asset.status}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
