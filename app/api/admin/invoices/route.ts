import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/server"
import { getAllInvoices, createInvoice } from "@/lib/payments/actions"
import type { CreateInvoiceRequest } from "@/lib/types/payment"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const invoices = await getAllInvoices()
    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Error in GET /api/admin/invoices:", error)
    return NextResponse.json(
      { error: "Lỗi server khi lấy danh sách hóa đơn" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    const body: CreateInvoiceRequest = await request.json()
    
    // Validate required fields
    if (!body.user_id || !body.apartment_id || !body.type || !body.amount || !body.due_date) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      )
    }

    const result = await createInvoice(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/admin/invoices:", error)
    return NextResponse.json(
      { error: "Lỗi server khi tạo hóa đơn" },
      { status: 500 }
    )
  }
}
