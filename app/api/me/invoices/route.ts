import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/server"
import { getCurrentUserInvoices } from "@/lib/payments/actions"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Người dùng chưa đăng nhập" },
        { status: 401 }
      )
    }

    const result = await getCurrentUserInvoices()
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Return the invoices array directly (matching admin invoices format)
    return NextResponse.json(result.invoices || [])
  } catch (error) {
    console.error("Error in GET /api/me/invoices:", error)
    return NextResponse.json(
      { error: "Lỗi server khi lấy hóa đơn" },
      { status: 500 }
    )
  }
}
