import { requireSession } from "@/lib/session";
import { getNotificationPreferences } from "@/features/settings/actions";
import { NotificationSettingsForm } from "@/features/settings/components/notification-settings-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

export default async function SettingsPage() {
  const session = await requireSession();
  const prefs = await getNotificationPreferences();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Your account and notification preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="size-12">
            {session.user.image && <AvatarImage src={session.user.image} alt={session.user.name} />}
            <AvatarFallback>{initials(session.user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{session.user.name}</span>
            <span className="text-sm text-muted-foreground">{session.user.email}</span>
          </div>
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
