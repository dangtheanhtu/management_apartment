import DashboardUserMenu from "./dashboard-user-menu"
import type { CurrentUser } from "@/lib/types/user"

interface UserNavProps {
  user: CurrentUser
}

export function UserNav({ user }: UserNavProps) {
  return <DashboardUserMenu user={user} />
}
