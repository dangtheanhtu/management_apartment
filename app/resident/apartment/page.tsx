import { getCurrentUser } from "@/lib/auth/server"
import { getResidentApartment } from "@/lib/resident/actions"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, Bed, Bath, Maximize, DoorOpen } from "lucide-react"

export default async function ResidentApartmentPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "resident") {
    redirect("/dashboard")
  }

  const residentData = await getResidentApartment()

  if (!residentData || !residentData.apartment) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Căn hộ của tôi</h1>
          <p className="text-muted-foreground">Thông tin căn hộ của bạn</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Chưa được phân căn hộ</CardTitle>
            <CardDescription>
              Bạn chưa được phân căn hộ nào. Vui lòng liên hệ với quản trị viên.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const { apartment } = residentData

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Căn hộ của tôi</h1>
        <p className="text-muted-foreground">Căn hộ số {apartment.unit_number}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết căn hộ</CardTitle>
            <CardDescription>Thông tin cơ bản về căn hộ của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Số căn hộ</span>
              </div>
              <span className="text-2xl font-bold">{apartment.unit_number}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DoorOpen className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Tầng</span>
              </div>
              <span className="text-xl font-semibold">{apartment.floor}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Phòng ngủ</span>
              </div>
              <span className="text-xl font-semibold">{apartment.bedrooms}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Phòng tắm</span>
              </div>
              <span className="text-xl font-semibold">{apartment.bathrooms}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Maximize className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Diện tích (m²)</span>
              </div>
              <span className="text-xl font-semibold">{apartment.square_feet} m²</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin cư trú</CardTitle>
            <CardDescription>Chi tiết hợp đồng thuê của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ngày chuyển vào</p>
              <p className="text-lg font-semibold">{new Date(residentData.move_in_date).toLocaleDateString()}</p>
            </div>
            {residentData.move_out_date && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ngày chuyển ra</p>
                <p className="text-lg font-semibold">{new Date(residentData.move_out_date).toLocaleDateString()}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
              <Badge variant={apartment.status === "occupied" ? "default" : "secondary"} className="mt-1">
                {apartment.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Số ngày ở</p>
              <p className="text-lg font-semibold">
                {Math.floor(
                  (new Date().getTime() - new Date(residentData.move_in_date).getTime()) / (1000 * 60 * 60 * 24),
                )}{" "}
                ngày
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {apartment.description && (
        <Card>
          <CardHeader>
            <CardTitle>Mô tả</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{apartment.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
