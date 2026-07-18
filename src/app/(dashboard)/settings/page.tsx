import { getNotificationPreferences } from "@/features/settings/actions";
import { NotificationSettingsForm } from "@/features/settings/components/notification-settings-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const prefs = await getNotificationPreferences();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Notification and display preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            App Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Vault Asset Manager — personal edition. No accounts, no sign-in required.
          </p>
        </CardContent>
      </Card>

      <NotificationSettingsForm
        initial={{
          inAppEnabled: prefs.inAppEnabled,
          emailEnabled: prefs.emailEnabled,
          browserEnabled: prefs.browserEnabled,
          defaultReminderDays: prefs.defaultReminderDays,
        }}
      />
    </div>
  );
}
