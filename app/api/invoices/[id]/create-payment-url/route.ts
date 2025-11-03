import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/server"
import { createPaymentUrl } from "@/lib/payments/actions"
import type { PaymentUrlRequest } from "@/lib/types/payment"

export async function POST(
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

    const body: Omit<PaymentUrlRequest, 'invoice_id'> = await request.json()
    
    // Validate required fields
    if (!body.payment_gateway) {
      return NextResponse.json(
        { error: "Thiếu thông tin cổng thanh toán" },
        { status: 400 }
      )
    }

    const paymentRequest: PaymentUrlRequest = {
      invoice_id: params.id,
      payment_gateway: body.payment_gateway,
      return_url: body.return_url
    }

    const result = await createPaymentUrl(paymentRequest)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("[v0] Error in POST /api/invoices/[id]/create-payment-url:", error)
    return NextResponse.json(
      { error: "Lỗi server khi tạo URL thanh toán" },
      { status: 500 }
    )
  }
}
