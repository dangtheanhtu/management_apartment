"use server"

import { connectDB } from "@/lib/mongodb/connection"
import { Invoice, Transaction } from "@/lib/mongodb/models"
import { getCurrentUser } from "@/lib/auth/server"

export async function getInvoiceById(invoiceId: string) {
  try {
    await connectDB()
    
    const invoice: any = await Invoice.findById(invoiceId)
      .populate('apartmentId', 'apartmentNumber building floor')
      .populate('userId', 'fullName email')
      .lean()

    if (!invoice) {
      return { error: "Không tìm thấy hóa đơn" }
    }

    return { 
      success: true, 
      invoice: {
        id: invoice._id.toString(),
        invoice_number: invoice.invoiceNumber,
        user_id: invoice.userId?._id?.toString(),
        user_name: invoice.userId?.fullName,
        user_email: invoice.userId?.email,
        apartment_id: invoice.apartmentId?._id?.toString(),
        apartment_number: invoice.apartmentId?.apartmentNumber,
        building: invoice.apartmentId?.building,
        type: invoice.type,
        amount: invoice.amount,
        status: invoice.status,
        issue_date: invoice.issueDate?.toISOString(),
        due_date: invoice.dueDate?.toISOString(),
        paid_date: invoice.paidDate?.toISOString(),
        created_at: invoice.createdAt?.toISOString(),
        description: invoice.description
      }
    }
  } catch (error) {
    console.error("Error getting invoice:", error)
    return { error: "Lỗi server khi lấy thông tin hóa đơn" }
  }
}

export async function getCurrentUserInvoices(filters?: {
  status?: string
  page?: number
  limit?: number
}) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Người dùng chưa đăng nhập" }
    }

    await connectDB()

    // Update overdue invoices first
    await updateOverdueInvoices()

    const page = filters?.page || 1
    const limit = filters?.limit || 50
    const skip = (page - 1) * limit

    console.log('[DEBUG] Current user ID:', user.id)
    
    let query: any = { userId: user.id }
    if (filters?.status) {
      query.status = filters.status
    }

    console.log('[DEBUG] Query for invoices:', query)

    const invoices = await Invoice.find(query)
      .populate('apartmentId', 'apartmentNumber building')
      .sort({ dueDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    console.log('[DEBUG] Found invoices count:', invoices.length)
    console.log('[DEBUG] Sample invoice:', invoices[0])

    const total = await Invoice.countDocuments(query)

    return {
      success: true,
      invoices: invoices.map((invoice: any) => ({
        id: invoice._id.toString(),
        invoice_number: invoice.invoiceNumber,
        user_id: invoice.userId.toString(),
        apartment_id: invoice.apartmentId?._id.toString(),
        apartment_number: invoice.apartmentId?.apartmentNumber,
        building: invoice.apartmentId?.building,
        type: invoice.type,
        amount: invoice.amount,
        status: invoice.status,
        issue_date: invoice.issueDate?.toISOString(),
        due_date: invoice.dueDate?.toISOString(),
        paid_date: invoice.paidDate?.toISOString(),
        created_at: invoice.createdAt?.toISOString(),
        description: invoice.description
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error("Error getting user invoices:", error)
    return { error: "Lỗi server khi lấy danh sách hóa đơn" }
  }
}

export async function getCurrentUserTransactions(filters?: {
  page?: number
  limit?: number
}) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Người dùng chưa đăng nhập" }
    }

    await connectDB()

    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const skip = (page - 1) * limit

    const transactions = await Transaction.find({ userId: user.id })
      .populate('invoiceId', 'invoiceNumber amount dueDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Transaction.countDocuments({ userId: user.id })

    return {
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error("Error getting user transactions:", error)
    return { error: "Lỗi server khi lấy lịch sử giao dịch" }
  }
}

export async function updateOverdueInvoices() {
  try {
    await connectDB()

    // Update all pending invoices where due date has passed
    const result = await Invoice.updateMany(
      {
        status: 'pending',
        dueDate: { $lt: new Date() }
      },
      {
        $set: { status: 'overdue' }
      }
    )

    console.log(`Updated ${result.modifiedCount} invoices to overdue status`)

    return {
      success: true,
      updated: result.modifiedCount
    }
  } catch (error) {
    console.error("Error updating overdue invoices:", error)
    return { error: "Lỗi server khi cập nhật hóa đơn quá hạn" }
  }
}

export async function getInvoiceStats() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return { error: "Không có quyền truy cập" }
    }

    await connectDB()

    // Update overdue invoices first
    await updateOverdueInvoices()

    const totalInvoices = await Invoice.countDocuments()
    const paidInvoices = await Invoice.countDocuments({ status: 'paid' })
    const pendingInvoices = await Invoice.countDocuments({ status: 'pending' })
    const overdueInvoices = await Invoice.countDocuments({ status: 'overdue' })

    const totalAmount = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    const paidAmount = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    const pendingAmount = await Invoice.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    const overdueAmount = await Invoice.aggregate([
      { $match: { status: 'overdue' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    return {
      success: true,
      stats: {
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        overdueInvoices,
        totalAmount: totalAmount[0]?.total || 0,
        paidAmount: paidAmount[0]?.total || 0,
        pendingAmount: pendingAmount[0]?.total || 0,
        overdueAmount: overdueAmount[0]?.total || 0
      }
    }
  } catch (error) {
    console.error("Error getting invoice stats:", error)
    return { error: "Lỗi server khi lấy thống kê hóa đơn" }
  }
}

export async function getAllInvoices(filters?: {
  status?: string
  page?: number
  limit?: number
}) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return { error: "Không có quyền truy cập" }
    }

    await connectDB()

    // Update overdue invoices first
    await updateOverdueInvoices()

    const page = filters?.page || 1
    const limit = filters?.limit || 50
    const skip = (page - 1) * limit

    let query: any = {}
    if (filters?.status) {
      query.status = filters.status
    }

    const invoices = await Invoice.find(query)
      .populate('userId', 'fullName email')
      .populate('apartmentId', 'apartmentNumber building')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Invoice.countDocuments(query)

    return {
      success: true,
      invoices: invoices.map((invoice: any) => ({
        id: invoice._id.toString(),
        invoice_number: invoice.invoiceNumber,
        user_id: invoice.userId?._id.toString(),
        user_name: invoice.userId?.fullName,
        user_email: invoice.userId?.email,
        apartment_id: invoice.apartmentId?._id.toString(),
        apartment_number: invoice.apartmentId?.apartmentNumber,
        building: invoice.apartmentId?.building,
        type: invoice.type,
        amount: invoice.amount,
        status: invoice.status,
        due_date: invoice.dueDate?.toISOString(),
        paid_date: invoice.paidDate?.toISOString(),
        created_at: invoice.createdAt?.toISOString(),
        description: invoice.description
      })),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error("Error getting all invoices:", error)
    return { error: "Lỗi server khi lấy danh sách hóa đơn" }
  }
}

export async function getRevenueSummary(filters?: {
  startDate?: Date
  endDate?: Date
}) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return { error: "Không có quyền truy cập" }
    }

    await connectDB()

    let query: any = { status: 'paid' }
    if (filters?.startDate || filters?.endDate) {
      query.paidDate = {}
      if (filters.startDate) query.paidDate.$gte = filters.startDate
      if (filters.endDate) query.paidDate.$lte = filters.endDate
    }

    // Get total revenue
    const revenue = await Invoice.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    // Get revenue by type
    const revenueByType = await Invoice.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ])

    // Calculate revenue by category
    let rentRevenue = 0
    let utilityRevenue = 0
    let serviceRevenue = 0

    revenueByType.forEach((item: any) => {
      switch (item._id) {
        case 'rent':
          rentRevenue = item.total
          break
        case 'utilities':
          utilityRevenue = item.total
          break
        case 'maintenance':
        case 'parking':
        case 'other':
          serviceRevenue += item.total
          break
      }
    })

    const monthlyRevenue = await Invoice.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$paidDate' },
            month: { $month: '$paidDate' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ])

    return {
      success: true,
      revenue: {
        total: revenue[0]?.total || 0,
        rentRevenue,
        utilityRevenue,
        serviceRevenue,
        monthly: monthlyRevenue
      }
    }
  } catch (error) {
    console.error("Error getting revenue summary:", error)
    return { error: "Lỗi server khi lấy báo cáo doanh thu" }
  }
}

export async function createPaymentUrl(data: { invoice_id: string; payment_gateway: string; return_url?: string }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Người dùng chưa đăng nhập" }
    }

    await connectDB()

    const invoice = await Invoice.findById(data.invoice_id)
    if (!invoice) {
      return { error: "Không tìm thấy hóa đơn" }
    }

    // Check if user owns this invoice
    if (invoice.userId.toString() !== user.id.toString()) {
      return { error: "Bạn không có quyền thanh toán hóa đơn này" }
    }

    if (invoice.status === 'paid') {
      return { error: "Hóa đơn đã được thanh toán" }
    }

    // TODO: Integrate with actual payment gateway (VNPay, MoMo, etc.)
    // For now, return a mock payment URL
    const returnUrl = data.return_url || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/resident/invoices`
    const paymentUrl = `/payment/${data.invoice_id}?amount=${invoice.amount}&gateway=${data.payment_gateway}&returnUrl=${encodeURIComponent(returnUrl)}`

    return {
      success: true,
      data: {
        payment_url: paymentUrl,
        transaction_code: `TXN-${Date.now()}`,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
      }
    }
  } catch (error) {
    console.error("Error creating payment URL:", error)
    return { error: "Lỗi server khi tạo URL thanh toán" }
  }
}

export async function createInvoice(data: {
  user_id: string
  apartment_id: string
  type: string
  amount: number
  due_date: string
  description?: string
}) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return { error: "Không có quyền truy cập" }
    }

    await connectDB()

    // Generate invoice number
    const count = await Invoice.countDocuments()
    const invoiceNumber = `INV-${Date.now()}-${count + 1}`

    // Map type to lowercase for schema
    const typeMap: { [key: string]: string } = {
      'RENT': 'rent',
      'ELECTRICITY': 'utilities',
      'WATER': 'utilities',
      'INTERNET': 'utilities',
      'SERVICE': 'maintenance',
      'REPAIR': 'maintenance',
      'PARKING': 'parking',
      'OTHER': 'other'
    }

    // Create invoice
    const invoice = await Invoice.create({
      invoiceNumber,
      userId: data.user_id,
      apartmentId: data.apartment_id,
      type: typeMap[data.type] || 'other',
      amount: data.amount,
      issueDate: new Date(),
      dueDate: new Date(data.due_date),
      description: data.description || '',
      status: 'pending'
    })

    return {
      success: true,
      message: 'Tạo hóa đơn thành công',
      data: {
        id: invoice._id.toString(),
        invoice_number: invoice.invoiceNumber,
        user_id: invoice.userId.toString(),
        apartment_id: invoice.apartmentId.toString(),
        type: invoice.type,
        amount: invoice.amount,
        status: invoice.status,
        due_date: invoice.dueDate.toISOString(),
        created_at: invoice.createdAt?.toISOString()
      }
    }
  } catch (error) {
    console.error("Error creating invoice:", error)
    return { error: "Lỗi server khi tạo hóa đơn" }
  }
}
