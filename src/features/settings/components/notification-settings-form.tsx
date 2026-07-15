"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { updateNotificationPreferences } from "@/features/settings/actions";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Preferences {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  browserEnabled: boolean;
  defaultReminderDays: number[];
}

const REMINDER_OPTIONS = [30, 14, 7, 3, 1];

export function NotificationSettingsForm({ initial }: { initial: Preferences }) {
  const [prefs, setPrefs] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function save(next: Preferences) {
    setPrefs(next);
    setSaving(true);
    try {
      await updateNotificationPreferences(next);
      toast.success("Preferences saved");
    } catch {
      toast.error("Could not save preferences");
    } finally {
      setSaving(false);
    }
  }

  function toggleReminderDay(day: number) {
    const next = prefs.defaultReminderDays.includes(day)
      ? prefs.defaultReminderDays.filter((d) => d !== day)
      : [...prefs.defaultReminderDays, day].sort((a, b) => b - a);
    save({ ...prefs, defaultReminderDays: next });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-foreground">Notifications</CardTitle>
        {saving && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Row
          label="In-app notifications"
          description="Show the notification bell and its alerts."
          checked={prefs.inAppEnabled}
          onCheckedChange={(v) => save({ ...prefs, inAppEnabled: v })}
        />
        <Row
          label="Email notifications"
          description="Send renewal and credit-reset emails (delivery wired in Phase 3)."
          checked={prefs.emailEnabled}
          onCheckedChange={(v) => save({ ...prefs, emailEnabled: v })}
        />
        <Row
          label="Browser notifications"
          description="Push a native browser notification for urgent alerts."
          checked={prefs.browserEnabled}
          onCheckedChange={(v) => save({ ...prefs, browserEnabled: v })}
        />

        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <Label className="text-sm font-normal text-muted-foreground">
            Remind me before renewal
          </Label>
          <div className="flex flex-wrap gap-2">
            {REMINDER_OPTIONS.map((day) => {
              const active = prefs.defaultReminderDays.includes(day);
              return (
                <Button
                  key={day}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  onClick={() => toggleReminderDay(day)}
                >
                  {day}d
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
