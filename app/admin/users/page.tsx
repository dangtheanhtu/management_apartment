import { getAllUsers } from "@/lib/users/actions"
import { getCurrentUser } from "@/lib/auth/actions"
import { UserTable } from "@/components/users/user-table"
import { CreateUserDialog } from "@/components/users/create-user-dialog"
import { redirect } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default async function UsersPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.role !== "admin") {
    redirect("/dashboard")
  }

  const result = await getAllUsers()
  const users = (result.data || []) as any[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
          <p className="text-muted-foreground">Quản lý tất cả người dùng trong hệ thống</p>
        </div>
        <CreateUserDialog />
      </div>

      {result.error && (
        <Alert variant="destructive">
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      )}

      <UserTable users={users} />
    </div>
  )
}
