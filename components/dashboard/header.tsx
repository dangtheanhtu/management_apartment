import { getCurrentUser } from "@/lib/auth/server"
import { UserNav } from "./user-nav"
import { Building2 } from "lucide-react"
import Link from "next/link"

export async function DashboardHeader() {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="w-full flex items-center px-6 h-16">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-xl shadow-lg">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-gradient">
              StayEase
            </span>
            <p className="text-xs text-gray-500 -mt-1">Quản lý căn hộ thông minh</p>
          </div>
        </Link>
        
        <div className="ml-auto">
          {user && <UserNav user={user} />}
        </div>
      </div>
    </header>
  )
}
