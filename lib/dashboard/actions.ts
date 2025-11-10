'use server'

import { connectDB } from '@/lib/mongodb/connection'
import { User, Apartment, Invoice, ServiceRequest } from '@/lib/mongodb/models'

export async function getDashboardStats() {
  try {
    await connectDB()

    // Get counts
    const [
      totalUsers,
      totalApartments,
      occupiedApartments,
      activeResidents,
      pendingRequests,
      recentInvoices,
      recentRequests
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ['resident', 'staff'] } }),
      Apartment.countDocuments(),
      Apartment.countDocuments({ status: 'occupied' }),
      User.countDocuments({ role: 'resident' }),
      ServiceRequest.countDocuments({ status: 'pending' }),
      Invoice.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'fullName email')
        .populate('apartmentId', 'apartmentNumber')
        .lean(),
      ServiceRequest.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'fullName email')
        .populate('apartmentId', 'apartmentNumber')
        .lean()
    ])

    // Calculate occupancy rate
    const occupancyRate = totalApartments > 0 
      ? Math.round((occupiedApartments / totalApartments) * 100)
      : 0

    return {
      totalUsers,
      totalApartments,
      occupiedApartments,
      activeResidents,
      occupancyRate,
      pendingRequests,
      recentInvoices: recentInvoices.map((invoice: any) => ({
        id: invoice._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.totalAmount,
        status: invoice.status,
        dueDate: invoice.dueDate?.toISOString(),
        user: invoice.userId ? {
          name: invoice.userId.fullName,
          email: invoice.userId.email
        } : null,
        apartment: invoice.apartmentId ? {
          number: invoice.apartmentId.apartmentNumber
        } : null
      })),
      recentRequests: recentRequests.map((request: any) => ({
        id: request._id.toString(),
        title: request.title,
        category: request.category,
        status: request.status,
        priority: request.priority,
        createdAt: request.createdAt?.toISOString(),
        user: request.userId ? {
          name: request.userId.fullName,
          email: request.userId.email
        } : null,
        apartment: request.apartmentId ? {
          number: request.apartmentId.apartmentNumber
        } : null
      }))
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return null
  }
}
