"use client"

import type React from "react"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updateProfile } from "@/lib/profile/actions"
import { useRouter } from "next/navigation"
import type { CurrentUser } from "@/lib/types/user"

interface ProfileFormProps {
  user: CurrentUser
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateProfile({
      fullName: formData.get("fullName") as string,
      phone: formData.get("phone") as string,
    })

    setIsLoading(false)

    if (result.success) {
      setMessage({ type: "success", text: "Profile updated successfully!" })
      router.refresh()
    } else {
      setMessage({ type: "error", text: result.error || "Failed to update profile" })
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

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" name="fullName" defaultValue={user.fullName} required className="h-11" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={user.phone || ""}
          placeholder="+1234567890"
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" value={user.email} disabled className="h-11 bg-muted" />
        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full h-11">
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
