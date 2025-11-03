import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/server"
import { getInvoiceById } from "@/lib/payments/actions"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Người dùng chưa đăng nhập" },
        { status: 401 }
      )
    }

    const result = await getInvoiceById(params.id)

    if (result.error || !result.invoice) {
      return NextResponse.json(
        { error: result.error || "Hóa đơn không tồn tại" },
        { status: 404 }
      )
    }

    const invoice = result.invoice

    // Kiểm tra quyền truy cập - chỉ admin hoặc chủ hóa đơn mới xem được
    if (user.role !== "admin" && invoice.user_id !== user.id) {
      return NextResponse.json(
        { error: "Không có quyền truy cập hóa đơn này" },
        { status: 403 }
      )
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("[v0] Error in GET /api/invoices/[id]:", error)
    return NextResponse.json(
      { error: "Lỗi server khi lấy thông tin hóa đơn" },
      { status: 500 }
    )
  }
}
