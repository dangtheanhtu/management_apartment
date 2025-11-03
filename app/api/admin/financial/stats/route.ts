import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/server"
import { getInvoiceStats } from "@/lib/payments/actions"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const result = await getInvoiceStats()
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    // Transform to match frontend expectations (snake_case)
    const stats = {
      total_invoices: result.stats?.totalInvoices || 0,
      paid_invoices: result.stats?.paidInvoices || 0,
      pending_invoices: result.stats?.pendingInvoices || 0,
      overdue_invoices: result.stats?.overdueInvoices || 0,
      total_amount: result.stats?.totalAmount || 0,
      paid_amount: result.stats?.paidAmount || 0,
      pending_amount: result.stats?.pendingAmount || 0,
      overdue_amount: result.stats?.overdueAmount || 0,
      // Add counts for cards
      paid_count: result.stats?.paidInvoices || 0,
      pending_count: result.stats?.pendingInvoices || 0,
      overdue_count: result.stats?.overdueInvoices || 0
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error in GET /api/admin/financial/stats:", error)
    return NextResponse.json(
      { error: "Lỗi server khi lấy thống kê hóa đơn" },
      { status: 500 }
    )
  }
}
