import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Logo and branding */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-2xl flex items-center justify-center">
                <Building2 className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              StayEase
            </h1>
            <p className="text-gray-600 mt-2">Quản lý căn hộ thông minh và hiện đại</p>
          </div>
        </div>

        {/* Login form */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl font-bold text-center">Chào mừng trở lại</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Đăng nhập để truy cập bảng điều khiển
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <LoginForm />

            <div className="text-center text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium underline">
                Đăng ký tại đây
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
