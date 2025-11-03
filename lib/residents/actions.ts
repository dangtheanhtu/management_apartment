'use server'

import { connectDB } from '@/lib/mongodb/connection'
import { User, Apartment } from '@/lib/mongodb/models'
import bcrypt from 'bcryptjs'

export interface Resident {
  id: string
  email: string
  fullName: string
  phone?: string
  status: string
  apartment: {
    id: string
    apartmentNumber: string
    building?: string
    floor: number
  } | null
  move_in_date?: string | null
  lease_start_date?: string | null
  lease_end_date?: string | null
  monthly_rent?: number | null
  deposit_amount?: number | null
  createdAt?: string
}

export async function createResident(data: any) {
  try {
    await connectDB()

    const user_id = data.user_id
    const apartment_id = data.apartment_id
    const move_in_date = data.move_in_date
    const lease_start_date = data.lease_start_date
    const lease_end_date = data.lease_end_date
    const deposit_amount = data.deposit_amount
    const monthly_rent = data.monthly_rent
    const status = data.status

    // Validate
    if (!user_id || !apartment_id) {
      return { error: 'Vui lòng chọn cư dân và căn hộ' }
    }

    // Check if user exists
    const user = await User.findById(user_id)
    if (!user) {
      return { error: 'Không tìm thấy cư dân' }
    }

    // Check if apartment exists and is available
    const apartment = await Apartment.findById(apartment_id)
    if (!apartment) {
      return { error: 'Căn hộ không tồn tại' }
    }
    if (apartment.status !== 'available') {
      return { error: 'Căn hộ không khả dụng' }
    }

    // Update user with apartment and lease info
    await User.findByIdAndUpdate(user_id, {
      apartmentId: apartment_id,
      moveInDate: move_in_date ? new Date(move_in_date) : undefined,
      leaseStartDate: lease_start_date ? new Date(lease_start_date) : undefined,
      leaseEndDate: lease_end_date ? new Date(lease_end_date) : undefined,
      monthlyRent: monthly_rent,
      depositAmount: deposit_amount,
      status: status || 'active'
    })

    // Update apartment status to occupied
    await Apartment.findByIdAndUpdate(apartment_id, {
      status: 'occupied'
    })

    return { 
      success: true, 
      message: 'Phân công cư dân thành công'
    }
  } catch (error) {
    console.error('Create resident assignment error:', error)
    return { error: 'Có lỗi xảy ra khi phân công cư dân' }
  }
}

export async function updateResident(userId: string, formData: FormData) {
  try {
    await connectDB()

    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const apartmentId = formData.get('apartmentId') as string
    const status = formData.get('status') as string
    const move_in_date = formData.get('move_in_date') as string
    const lease_start_date = formData.get('lease_start_date') as string
    const lease_end_date = formData.get('lease_end_date') as string
    const monthly_rent = formData.get('monthly_rent') as string

    const user: any = await User.findById(userId)
    if (!user) {
      return { error: 'Không tìm thấy cư dân' }
    }

    const oldApartmentId = user.apartmentId?.toString()

    // Update user
    const updateData: any = {
      fullName: fullName || user.fullName,
      phone: phone || user.phone,
      status: status || user.status
    }

    // Update lease info
    if (move_in_date) {
      updateData.moveInDate = new Date(move_in_date)
    }
    if (lease_start_date) {
      updateData.leaseStartDate = new Date(lease_start_date)
    }
    if (lease_end_date) {
      updateData.leaseEndDate = new Date(lease_end_date)
    }
    if (monthly_rent) {
      updateData.monthlyRent = Number.parseFloat(monthly_rent)
    }

    if (apartmentId && apartmentId !== oldApartmentId) {
      // Check new apartment
      const apartment = await Apartment.findById(apartmentId)
      if (!apartment) {
        return { error: 'Căn hộ không tồn tại' }
      }
      if (apartment.status !== 'available' && apartmentId !== oldApartmentId) {
        return { error: 'Căn hộ không khả dụng' }
      }
      updateData.apartmentId = apartmentId

      // Update old apartment to available
      if (oldApartmentId) {
        await Apartment.findByIdAndUpdate(oldApartmentId, {
          status: 'available'
        })
      }

      // Update new apartment to occupied
      await Apartment.findByIdAndUpdate(apartmentId, {
        status: 'occupied'
      })
    }

    await User.findByIdAndUpdate(userId, updateData)

    return { success: true, message: 'Cập nhật cư dân thành công' }
  } catch (error) {
    console.error('Update resident error:', error)
    return { error: 'Có lỗi xảy ra khi cập nhật cư dân' }
  }
}

export async function deleteResident(userId: string) {
  try {
    await connectDB()

    const user: any = await User.findById(userId)
    if (!user) {
      return { error: 'Không tìm thấy cư dân' }
    }

    // Update apartment to available if user has one
    if (user.apartmentId) {
      await Apartment.findByIdAndUpdate(user.apartmentId, {
        status: 'available'
      })
    }

    // Delete user
    await User.findByIdAndDelete(userId)

    return { success: true, message: 'Xóa cư dân thành công' }
  } catch (error) {
    console.error('Delete resident error:', error)
    return { error: 'Có lỗi xảy ra khi xóa cư dân' }
  }
}

export async function getResidents(): Promise<Resident[]> {
  try {
    await connectDB()

    const residents = await User.find({ role: 'resident' })
      .populate('apartmentId', 'apartmentNumber building floor')
      .sort({ createdAt: -1 })
      .lean()

    return residents.map((resident: any) => ({
      id: resident._id.toString(),
      email: resident.email,
      fullName: resident.fullName,
      phone: resident.phone,
      status: resident.status,
      apartment: resident.apartmentId ? {
        id: resident.apartmentId._id.toString(),
        apartmentNumber: resident.apartmentId.apartmentNumber,
        building: resident.apartmentId.building,
        floor: resident.apartmentId.floor
      } : null,
      move_in_date: resident.moveInDate?.toISOString() || null,
      lease_start_date: resident.leaseStartDate?.toISOString() || null,
      lease_end_date: resident.leaseEndDate?.toISOString() || null,
      monthly_rent: resident.monthlyRent || null,
      deposit_amount: resident.depositAmount || null,
      createdAt: resident.createdAt?.toISOString()
    }))
  } catch (error) {
    console.error('Get residents error:', error)
    return []
  }
}
