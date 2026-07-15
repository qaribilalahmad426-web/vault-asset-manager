"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, ExternalLink, Pencil } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { formatMoney, cn, daysUntil } from "@/lib/utils";
import type { CalendarFeedItem } from "@/features/dashboard/actions";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Dot color for a day's most urgent item. Buckets are intentionally
 * continuous (no unclassified gap between them): urgent/red covers
 * anything inside 3 days (including overdue), orange covers the
 * 3–15 day "renewing soon" window, green covers everything calmer
 * than that — a superset of the "30+ days" and "7–15 day" reference
 * points from the spec, with no day left uncolored.
 */
function dotTone(days: number): "red" | "orange" | "green" {
  if (days < 3) return "red";
  if (days <= 15) return "orange";
  return "green";
}

const dotClasses: Record<"red" | "orange" | "green", string> = {
  red: "bg-destructive",
  orange: "bg-warning",
  green: "bg-success",
};

export function RenewalCalendar({ items }: { items: CalendarFeedItem[] }) {
  const [cursor, setCursor] = useState(() => new Date());

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const days = useMemo(() => eachDayOfInterval({ start: gridStart, end: gridEnd }), [gridStart, gridEnd]);

  const itemsByDay = useMemo(() => {
    const map = new Map<string, CalendarFeedItem[]>();
    for (const item of items) {
      const key = format(new Date(item.date), "yyyy-MM-dd");
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return map;
  }, [items]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-foreground">
          {format(cursor, "MMMM yyyy")}
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setCursor((d) => subMonths(d, 1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setCursor((d) => addMonths(d, 1))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border border-border bg-border text-xs">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="bg-muted/50 px-2 py-1.5 text-center font-medium text-muted-foreground">
              {label}
            </div>
          ))}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayItems = itemsByDay.get(key) ?? [];
            const inMonth = isSameMonth(day, cursor);
            const tones = new Set(
              dayItems.map((item) => dotTone(Math.max(daysUntil(item.date) ?? 0, -1)))
            );

            const cell = (
              <div
                className={cn(
                  "flex min-h-20 flex-col gap-1 bg-surface p-1.5 text-left transition-colors",
                  !inMonth && "bg-surface/50 text-muted-foreground/50",
                  dayItems.length > 0 && "cursor-pointer hover:bg-muted/40",
                  isToday(day) && "ring-1 ring-inset ring-primary/60"
                )}
              >
                <span className={cn("text-[11px]", isToday(day) && "font-semibold text-primary")}>
                  {format(day, "d")}
                </span>
                {dayItems.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {Array.from(tones).map((tone) => (
                      <span key={tone} className={cn("size-1.5 rounded-full", dotClasses[tone])} />
                    ))}
                    <span className="text-[10px] text-muted-foreground">{dayItems.length}</span>
                  </div>
                )}
              </div>
            );

            if (dayItems.length === 0) {
              return <div key={key}>{cell}</div>;
            }

            return (
              <Popover key={key}>
                <PopoverTrigger asChild>{cell}</PopoverTrigger>
                <PopoverContent align="start">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    {format(day, "EEEE, MMMM d")}
                  </p>
                  <div className="flex flex-col gap-3">
                    {dayItems.map((item) => (
                      <div key={item.id} className="flex flex-col gap-1.5 border-b border-border pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className="font-mono text-sm">
                            {formatMoney(item.priceCents ?? 0, item.currency)}
                          </span>
                        </div>
                        {item.emailUsed && (
                          <span className="text-xs text-muted-foreground">{item.emailUsed}</span>
                        )}
                        <div className="flex items-center gap-3 pt-1">
                          <Link
                            href={`/assets?assetId=${item.id}`}
                            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          >
                            <Pencil className="size-3" /> Edit
                          </Link>
                          {item.billingUrl && (
                            <a
                              href={item.billingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                            >
                              <ExternalLink className="size-3" /> Billing
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <LegendDot tone="green" label="30+ days" />
          <LegendDot tone="orange" label="7–15 days" />
          <LegendDot tone="red" label="Under 3 days" />
        </div>
      </CardContent>
    </Card>
  );
}

function LegendDot({ tone, label }: { tone: "red" | "orange" | "green"; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("size-1.5 rounded-full", dotClasses[tone])} />
      {label}
    </span>
  );
}
