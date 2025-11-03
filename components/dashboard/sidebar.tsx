"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Building, UserCheck, Settings, User, Sparkles, Receipt, DollarSign, MessageSquare, Wrench } from "lucide-react"
import type { UserRole } from "@/lib/types/user"

interface SidebarProps {
  userRole: UserRole
}

const adminNavItems = [
  {
    title: "Bảng điều khiển",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Quản lý người dùng",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Quản lý căn hộ",
    href: "/admin/apartments",
    icon: Building,
  },
  {
    title: "Quản lý cư dân",
    href: "/admin/residents",
    icon: UserCheck,
  },
  {
    title: "Tiện ích",
    href: "/admin/amenities",
    icon: Sparkles,
  },
  {
    title: "Cộng đồng",
    href: "/community",
    icon: MessageSquare,
  },
  {
    title: "Bảo trì",
    href: "/admin/maintenance",
    icon: Wrench,
  },
  {
    title: "Quản lý hóa đơn",
    href: "/admin/invoices",
    icon: Receipt,
  },
  {
    title: "Tài chính",
    href: "/admin/financial",
    icon: DollarSign,
  },
  {
    title: "Hồ sơ",
    href: "/admin/profile",
    icon: User,
  },
  {
    title: "Cài đặt",
    href: "/admin/settings",
    icon: Settings,
  },
]

const residentNavItems = [
  {
    title: "Bảng điều khiển",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Căn hộ của tôi",
    href: "/resident/apartment",
    icon: Building,
  },
  {
    title: "Tiện ích",
    href: "/resident/amenities",
    icon: Sparkles,
  },
  {
    title: "Cộng đồng",
    href: "/community",
    icon: MessageSquare,
  },
  {
    title: "Bảo trì",
    href: "/resident/maintenance",
    icon: Wrench,
  },
  {
    title: "Hóa đơn & Thanh toán",
    href: "/resident/invoices",
    icon: Receipt,
  },
  {
    title: "Hồ sơ",
    href: "/resident/profile",
    icon: User,
  },
  {
    title: "Cài đặt",
    href: "/resident/settings",
    icon: Settings,
  },
]

const staffNavItems = [
  {
    title: "Bảng điều khiển",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Cộng đồng",
    href: "/community",
    icon: MessageSquare,
  },
  {
    title: "Bảo trì",
    href: "/staff/maintenance",
    icon: Wrench,
  },
  {
    title: "Hóa đơn & Thanh toán",
    href: "/resident/invoices",
    icon: Receipt,
  },
  {
    title: "Hồ sơ",
    href: "/resident/profile",
    icon: User,
  },
  {
    title: "Cài đặt",
    href: "/resident/settings",
    icon: Settings,
  },
]

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const navItems = userRole === "admin" 
    ? adminNavItems 
    : userRole === "staff" 
    ? staffNavItems 
    : residentNavItems

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-gradient-to-b from-white to-gray-50 shadow-lg">
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "justify-start h-12 px-4 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md" 
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              )}
              asChild
            >
              <Link href={item.href}>
                <div className={cn(
                  "p-2 rounded-lg mr-3 transition-all duration-200",
                  isActive 
                    ? "bg-white/20" 
                    : "bg-gray-100 group-hover:bg-blue-100"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-medium">{item.title}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            </Button>
          )
        })}
      </nav>
      
      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
    </aside>
  )
}
