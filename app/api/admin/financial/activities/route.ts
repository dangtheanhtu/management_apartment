import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/server"
import { connectDB } from "@/lib/mongodb/connection"
import { Invoice, Transaction } from "@/lib/mongodb/models"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      )
    }

    await connectDB()

    // Get recent paid invoices (recent transactions)
    const recentPaidInvoices = await Invoice.find({ status: 'paid' })
      .sort({ paidDate: -1 })
      .limit(3)
      .populate('userId', 'fullName email')
      .populate('apartmentId', 'apartmentNumber')
      .lean()

    // Get recent created invoices
    const recentCreatedInvoices = await Invoice.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('userId', 'fullName email')
      .populate('apartmentId', 'apartmentNumber')
      .lean()

    // Get upcoming due invoices
    const upcomingDueInvoices = await Invoice.find({
      status: 'pending',
      dueDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Next 3 days
      }
    })
      .sort({ dueDate: 1 })
      .limit(5)
      .populate('userId', 'fullName email')
      .populate('apartmentId', 'apartmentNumber')
      .lean()

    const activities = []

    // Add paid invoices as activities
    recentPaidInvoices.forEach((invoice: any) => {
      activities.push({
        id: invoice._id.toString(),
        type: 'payment',
        title: 'Thanh toán thành công',
        description: `${invoice.userId?.fullName || 'N/A'} - Căn hộ ${invoice.apartmentId?.apartmentNumber || 'N/A'} - ${invoice.amount?.toLocaleString()} VNĐ`,
        amount: invoice.amount,
        timestamp: invoice.paidDate || invoice.updatedAt || invoice.createdAt,
        icon: 'dollar',
        color: 'green'
      })
    })

    // Add created invoices as activities
    recentCreatedInvoices.forEach((invoice: any) => {
      activities.push({
        id: invoice._id.toString(),
        type: 'invoice',
        title: 'Hóa đơn mới',
        description: `${invoice.userId?.fullName || 'N/A'} - Căn hộ ${invoice.apartmentId?.apartmentNumber || 'N/A'} - ${invoice.amount?.toLocaleString()} VNĐ`,
        amount: invoice.amount,
        timestamp: invoice.createdAt,
        icon: 'receipt',
        color: 'blue'
      })
    })

    // Add upcoming due as one activity
    if (upcomingDueInvoices.length > 0) {
      const totalAmount = upcomingDueInvoices.reduce((sum: number, inv: any) => sum + inv.amount, 0)
      activities.push({
        id: 'upcoming-due',
        type: 'reminder',
        title: 'Hóa đơn sắp đến hạn',
        description: `${upcomingDueInvoices.length} hóa đơn sẽ hết hạn trong 3 ngày tới - Tổng: ${totalAmount.toLocaleString()} VNĐ`,
        amount: totalAmount,
        timestamp: new Date(),
        icon: 'calendar',
        color: 'yellow'
      })
    }

    // Sort by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Take top 5
    const topActivities = activities.slice(0, 5)

    return NextResponse.json({
      success: true,
      activities: topActivities
    })

  } catch (error) {
    console.error("Error getting financial activities:", error)
    return NextResponse.json(
      { error: "Lỗi server khi lấy hoạt động tài chính" },
      { status: 500 }
    )
  }
}
