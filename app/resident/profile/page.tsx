import { getCurrentUser } from "@/lib/auth/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import { ProfileForm } from "@/components/profile/profile-form"
import { Badge } from "@/components/ui/badge"

export default async function ResidentProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Allow resident and staff to access profile
  if (user.role !== "resident" && user.role !== "staff") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hồ sơ của tôi</h1>
        <p className="text-muted-foreground">Quản lý thông tin cá nhân và ảnh đại diện</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Ảnh đại diện</CardTitle>
            <CardDescription>Tải lên ảnh đại diện của bạn</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <AvatarUpload currentAvatarUrl={user.avatarUrl} userName={user.fullName} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={user} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trạng thái tài khoản</CardTitle>
          <CardDescription>Thông tin tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Vai trò</span>
            <Badge variant="secondary" className="capitalize">
              {user.role}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Trạng thái</span>
            <Badge variant={user.status === "active" ? "default" : "destructive"} className="capitalize">
              {user.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
