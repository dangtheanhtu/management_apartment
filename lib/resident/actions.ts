'use server'

import { connectDB } from '@/lib/mongodb/connection'
import { User, Apartment, Invoice, ServiceRequest } from '@/lib/mongodb/models'
import { getCurrentUser } from '@/lib/auth/server'

export async function getResidentDashboardStats() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return null
    }

    await connectDB()

    // Find resident's apartment
    const user: any = await User.findById(currentUser.id).lean()
    if (!user || !user.apartmentId) {
      return {
        hasApartment: false
      }
    }

    const apartmentId = user.apartmentId

    // Get counts
    const [
      apartment,
      totalInvoices,
      pendingInvoices,
      paidInvoices,
      totalRequests,
      pendingRequests,
      recentInvoices,
      recentRequests
    ] = await Promise.all([
      Apartment.findById(apartmentId).lean(),
      Invoice.countDocuments({ userId: currentUser.id }),
      Invoice.countDocuments({ userId: currentUser.id, status: 'pending' }),
      Invoice.countDocuments({ userId: currentUser.id, status: 'paid' }),
      ServiceRequest.countDocuments({ userId: currentUser.id }),
      ServiceRequest.countDocuments({ userId: currentUser.id, status: 'pending' }),
      Invoice.find({ userId: currentUser.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      ServiceRequest.find({ userId: currentUser.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ])

    const apt: any = apartment

    return {
      hasApartment: true,
      apartment: apt ? {
        id: apt._id.toString(),
        apartmentNumber: apt.apartmentNumber,
        floor: apt.floor,
        bedrooms: apt.bedrooms,
        bathrooms: apt.bathrooms,
        area: apt.area,
        rentPrice: apt.rentPrice,
        status: apt.status
      } : null,
      totalInvoices,
      pendingInvoices,
      paidInvoices,
      totalRequests,
      pendingRequests,
      recentInvoices: recentInvoices.map((invoice: any) => ({
        id: invoice._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.totalAmount,
        status: invoice.status,
        dueDate: invoice.dueDate?.toISOString(),
        createdAt: invoice.createdAt?.toISOString()
      })),
      recentRequests: recentRequests.map((request: any) => ({
        id: request._id.toString(),
        title: request.title,
        category: request.category,
        status: request.status,
        priority: request.priority,
        createdAt: request.createdAt?.toISOString()
      }))
    }
  } catch (error) {
    console.error('Error fetching resident dashboard stats:', error)
    return null
  }
}

export async function getResidentApartment() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return null
    }

    await connectDB()

    const user: any = await User.findById(currentUser.id).lean()
    if (!user || !user.apartmentId) {
      return null
    }

    const apartment: any = await Apartment.findById(user.apartmentId).lean()
    if (!apartment) {
      return null
    }

    return {
      apartment: {
        id: apartment._id.toString(),
        apartmentNumber: apartment.apartmentNumber,
        unit_number: apartment.apartmentNumber,
        floor: apartment.floor,
        bedrooms: apartment.bedrooms,
        bathrooms: apartment.bathrooms,
        area: apartment.area,
        rentPrice: apartment.rentPrice,
        rent_price: apartment.rentPrice,
        status: apartment.status,
        description: apartment.description,
        amenities: apartment.amenities
      }
    }
  } catch (error) {
    console.error('Error fetching resident apartment:', error)
    return null
  }
}
