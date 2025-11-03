import { NextRequest, NextResponse } from "next/server"
import { processPaymentCallback } from "@/lib/payments/actions"
import type { PaymentCallbackData } from "@/lib/types/payment"

export async function POST(request: NextRequest) {
  try {
    const body: PaymentCallbackData = await request.json()
    
    // Validate required fields
    if (!body.transaction_code || !body.amount || !body.status) {
      return NextResponse.json(
        { error: "Thiếu thông tin callback" },
        { status: 400 }
      )
    }

    const result = await processPaymentCallback(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in POST /api/payment/callback:", error)
    return NextResponse.json(
      { error: "Lỗi server khi xử lý callback" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const transactionCode = searchParams.get('transaction_code')
    const amount = searchParams.get('amount')
    const status = searchParams.get('status')
    
    if (!transactionCode || !amount || !status) {
      return NextResponse.json(
        { error: "Thiếu thông tin callback" },
        { status: 400 }
      )
    }

    const callbackData: PaymentCallbackData = {
      transaction_code: transactionCode,
      amount: parseFloat(amount),
      status: status as 'SUCCESS' | 'FAILED' | 'PENDING',
      gateway_response: Object.fromEntries(searchParams.entries())
    }

    const result = await processPaymentCallback(callbackData)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Redirect to success page
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?transaction_code=${transactionCode}`
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("Error in GET /api/payment/callback:", error)
    const errorUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/payment/error`
    return NextResponse.redirect(errorUrl)
  }
}
