import { getCurrentUser } from "@/lib/auth/actions"
import { getDashboardStats } from "@/lib/dashboard/actions"
import { getResidentDashboardStats, getResidentApartment } from "@/lib/resident/actions"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Users, Building, UserCheck, Home, Calendar, Clock, Wrench, MessageSquare, Receipt, User } from "lucide-react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Staff dashboard
  if (user.role === "staff") {
    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Chào mừng trở lại!</h1>
              <p className="text-green-100 text-lg">{user.fullName}</p>
              <p className="text-green-200 mt-2">Nhân viên bảo trì - Quản lý yêu cầu sửa chữa</p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <Wrench className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Thao tác nhanh
              </CardTitle>
              <CardDescription>Các chức năng chính của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/staff/maintenance">
                  <Wrench className="w-4 h-4 mr-2" />
                  Quản lý yêu cầu bảo trì
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/community">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Cộng đồng
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/resident/profile">
                  <User className="w-4 h-4 mr-2" />
                  Hồ sơ của tôi
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Thông tin công việc
              </CardTitle>
              <CardDescription>Trách nhiệm và quyền hạn của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Quản lý yêu cầu bảo trì</p>
                    <p className="text-sm text-gray-500">Xem và xử lý các yêu cầu sửa chữa từ cư dân</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Tương tác cộng đồng</p>
                    <p className="text-sm text-gray-500">Xem và tương tác với bài viết trong cộng đồng</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Xem hóa đơn</p>
                    <p className="text-sm text-gray-500">Kiểm tra hóa đơn lương và thanh toán</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Admin dashboard
  if (user.role === "admin") {
    const stats = await getDashboardStats()

    if (!stats) {
      return <div>Error loading dashboard</div>
    }

    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Chào mừng trở lại!</h1>
              <p className="text-blue-100 text-lg">{user.fullName}</p>
              <p className="text-blue-200 mt-2">Quản lý căn hộ một cách hiệu quả và thông minh</p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <Building className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="Tổng người dùng" 
            value={stats.totalUsers} 
            description="Tất cả người dùng đã đăng ký" 
            icon={Users}
            className="hover:shadow-lg transition-all duration-300"
          />
          <StatsCard
            title="Tổng căn hộ"
            value={stats.totalApartments}
            description="Tất cả đơn vị căn hộ"
            icon={Building}
            className="hover:shadow-lg transition-all duration-300"
          />
          <StatsCard
            title="Căn hộ đã thuê"
            value={stats.occupiedApartments}
            description="Hiện đang có người ở"
            icon={Home}
            className="hover:shadow-lg transition-all duration-300"
          />
          <StatsCard
            title="Cư dân hoạt động"
            value={stats.activeResidents}
            description="Cư dân hiện tại"
            icon={UserCheck}
            className="hover:shadow-lg transition-all duration-300"
          />
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Thao tác nhanh
              </CardTitle>
              <CardDescription>Các hành động thường dùng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/users">
                  <Users className="w-4 h-4 mr-2" />
                  Thêm người dùng
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/apartments">
                  <Building className="w-4 h-4 mr-2" />
                  Thêm căn hộ
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/residents">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Phân công cư dân
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Hoạt động gần đây
              </CardTitle>
              <CardDescription>Các hoạt động mới nhất trong hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Người dùng mới đăng ký</p>
                    <p className="text-sm text-gray-500">John Doe đã tạo tài khoản</p>
                  </div>
                  <span className="text-xs text-gray-400">2 giờ trước</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Căn hộ mới được thêm</p>
                    <p className="text-sm text-gray-500">Căn hộ A301 đã được tạo</p>
                  </div>
                  <span className="text-xs text-gray-400">4 giờ trước</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Cư dân được phân công</p>
                    <p className="text-sm text-gray-500">Jane Smith đã được phân căn hộ B102</p>
                  </div>
                  <span className="text-xs text-gray-400">6 giờ trước</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const stats = await getResidentDashboardStats()
  const residentData = await getResidentApartment()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển của tôi</h1>
        <p className="text-muted-foreground">Chào mừng trở lại, {user.fullName}</p>
      </div>

      {!stats?.hasApartment ? (
        <Card>
          <CardHeader>
            <CardTitle>Chưa được phân căn hộ</CardTitle>
            <CardDescription>
              Bạn chưa được phân căn hộ nào. Vui lòng liên hệ với quản trị viên.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatsCard
              title="Căn hộ của tôi"
              value={residentData?.apartment?.unit_number || "N/A"}
              description={`${residentData?.apartment?.bedrooms || 0} phòng ngủ, ${residentData?.apartment?.bathrooms || 0} phòng tắm`}
              icon={Building}
            />
            <StatsCard
              title="Ngày chuyển vào"
              value={stats.moveInDate ? new Date(stats.moveInDate).toLocaleDateString() : "N/A"}
              description="Bắt đầu sống tại đây"
              icon={Calendar}
            />
            <StatsCard
              title="Số ngày ở"
              value={stats.daysLiving}
              description="Tổng số ngày trong căn hộ"
              icon={Clock}
            />
          </div>

          {residentData?.apartment && (
            <Card>
              <CardHeader>
                <CardTitle>Chi tiết căn hộ</CardTitle>
                <CardDescription>Thông tin không gian sống hiện tại của bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Số căn hộ</p>
                    <p className="text-2xl font-bold">{residentData.apartment.unit_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tầng</p>
                    <p className="text-2xl font-bold">{residentData.apartment.floor}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phòng ngủ</p>
                    <p className="text-2xl font-bold">{residentData.apartment.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phòng tắm</p>
                    <p className="text-2xl font-bold">{residentData.apartment.bathrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Diện tích (m²)</p>
                    <p className="text-2xl font-bold">{residentData.apartment.square_feet}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
                    <p className="text-2xl font-bold capitalize">{residentData.apartment.status}</p>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href="/resident/apartment">Xem chi tiết đầy đủ</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
