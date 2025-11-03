import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/server"
import { connectDB } from "@/lib/mongodb/connection"
import { Invoice, Transaction } from "@/lib/mongodb/models"

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

    const body = await request.json()
    const { payment_gateway, transaction_code } = body

    await connectDB()

    const invoice = await Invoice.findById(params.id)
    
    if (!invoice) {
      return NextResponse.json(
        { error: "Không tìm thấy hóa đơn" },
        { status: 404 }
      )
    }

    // Check if user owns this invoice
    if (invoice.userId.toString() !== user.id) {
      return NextResponse.json(
        { error: "Bạn không có quyền thanh toán hóa đơn này" },
        { status: 403 }
      )
    }

    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: "Hóa đơn đã được thanh toán" },
        { status: 400 }
      )
    }

    // Update invoice status
    invoice.status = 'paid'
    ;(invoice as any).paidDate = new Date()
    await invoice.save()

    // Create transaction record - fix field names to match schema
    const transaction = await Transaction.create({
      invoiceId: invoice._id,
      userId: user.id,
      paymentGateway: payment_gateway?.toLowerCase() || 'vnpay', // Convert to lowercase
      transactionCode: transaction_code,
      amountPaid: invoice.amount, // Changed from 'amount' to 'amountPaid'
      status: 'completed', // Changed from 'success' to 'completed'
      paymentDate: new Date()
    })

    return NextResponse.json({
      success: true,
      message: "Thanh toán thành công",
      invoice: {
        id: invoice._id.toString(),
        status: invoice.status,
        paid_date: (invoice as any).paidDate
      },
      transaction: {
        id: transaction._id.toString(),
        transaction_code: transaction.transactionCode
      }
    })
  } catch (error) {
    console.error("[v0] Error in POST /api/invoices/[id]/confirm-payment:", error)
    return NextResponse.json(
      { error: "Lỗi server khi xác nhận thanh toán" },
      { status: 500 }
    )
  }
}
