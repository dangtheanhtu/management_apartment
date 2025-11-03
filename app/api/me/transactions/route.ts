import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/server"
import { getCurrentUserTransactions } from "@/lib/payments/actions"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Người dùng chưa đăng nhập" },
        { status: 401 }
      )
    }

    const transactions = await getCurrentUserTransactions()
    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error in GET /api/me/transactions:", error)
    return NextResponse.json(
      { error: "Lỗi server khi lấy lịch sử giao dịch" },
      { status: 500 }
    )
  }
}
