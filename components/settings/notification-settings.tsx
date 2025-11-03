"use client"

import type React from "react"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { updateUserPreferences } from "@/lib/profile/actions"
import { useRouter } from "next/navigation"
import type { UserPreferences } from "@/lib/types/user"

interface NotificationSettingsProps {
  preferences?: UserPreferences | null
}

export function NotificationSettings({ preferences = null }: NotificationSettingsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [settings, setSettings] = useState({
    email_notifications: preferences?.email_notifications ?? true,
    sms_notifications: preferences?.sms_notifications ?? false,
    push_notifications: preferences?.push_notifications ?? true,
    maintenance_alerts: preferences?.maintenance_alerts ?? true,
    payment_reminders: preferences?.payment_reminders ?? true,
    community_updates: preferences?.community_updates ?? true,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const result = await updateUserPreferences(settings)

    setIsLoading(false)

    if (result.success) {
      setMessage({ type: "success", text: "Notification preferences updated!" })
      router.refresh()
    } else {
      setMessage({ type: "error", text: result.error || "Failed to update preferences" })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`rounded-lg p-4 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
          </div>
          <Switch
            id="email"
            checked={settings.email_notifications}
            onCheckedChange={(checked) => setSettings({ ...settings, email_notifications: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sms">SMS Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
          </div>
          <Switch
            id="sms"
            checked={settings.sms_notifications}
            onCheckedChange={(checked) => setSettings({ ...settings, sms_notifications: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push">Push Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
          </div>
          <Switch
            id="push"
            checked={settings.push_notifications}
            onCheckedChange={(checked) => setSettings({ ...settings, push_notifications: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="maintenance">Maintenance Alerts</Label>
            <p className="text-sm text-muted-foreground">Get notified about maintenance schedules</p>
          </div>
          <Switch
            id="maintenance"
            checked={settings.maintenance_alerts}
            onCheckedChange={(checked) => setSettings({ ...settings, maintenance_alerts: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="payment">Payment Reminders</Label>
            <p className="text-sm text-muted-foreground">Receive reminders for rent payments</p>
          </div>
          <Switch
            id="payment"
            checked={settings.payment_reminders}
            onCheckedChange={(checked) => setSettings({ ...settings, payment_reminders: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="community">Community Updates</Label>
            <p className="text-sm text-muted-foreground">Stay informed about community events</p>
          </div>
          <Switch
            id="community"
            checked={settings.community_updates}
            onCheckedChange={(checked) => setSettings({ ...settings, community_updates: checked })}
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : "Save Preferences"}
      </Button>
    </form>
  )
}
