import type React from "react"
import { getCurrentUser } from "@/lib/auth/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { redirect } from "next/navigation"

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Only staff can access staff routes
  if (user.role !== "staff") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader />
      <div className="flex">
        <Sidebar userRole={user.role} />
        <main className="flex-1 ml-64 p-8">{children}</main>
      </div>
    </div>
  )
}
