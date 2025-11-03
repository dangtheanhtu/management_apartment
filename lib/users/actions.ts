'use server'

import { connectDB } from '@/lib/mongodb/connection'
import { User, Apartment } from '@/lib/mongodb/models'
import bcrypt from 'bcryptjs'

export async function createUser(formData: FormData) {
  try {
    await connectDB()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const role = formData.get('role') as 'admin' | 'staff' | 'resident'
    const apartmentId = formData.get('apartmentId') as string

    // Validate
    if (!email || !password || !fullName || !role) {
      return { error: 'Vui lòng điền đầy đủ thông tin bắt buộc' }
    }

    // Check if email exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return { error: 'Email đã tồn tại' }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      fullName,
      phone: phone || undefined,
      role,
      status: 'active',
      apartmentId: apartmentId || undefined
    })

    // Update apartment if assigned
    if (apartmentId && role === 'resident') {
      await Apartment.findByIdAndUpdate(apartmentId, {
        status: 'occupied'
      })
    }

    return { 
      success: true, 
      message: 'Tạo người dùng thành công',
      userId: user._id.toString()
    }
  } catch (error) {
    console.error('Create user error:', error)
    return { error: 'Có lỗi xảy ra khi tạo người dùng' }
  }
}

export async function updateUser(userId: string, formData: FormData) {
  try {
    await connectDB()

    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const role = formData.get('role') as string
    const status = formData.get('status') as string

    const updateData: any = {}
    if (fullName) updateData.fullName = fullName
    if (phone) updateData.phone = phone
    if (role) updateData.role = role
    if (status) updateData.status = status

    await User.findByIdAndUpdate(userId, updateData)

    return { success: true, message: 'Cập nhật người dùng thành công' }
  } catch (error) {
    console.error('Update user error:', error)
    return { error: 'Có lỗi xảy ra khi cập nhật người dùng' }
  }
}

export async function deleteUser(userId: string) {
  try {
    await connectDB()

    const user: any = await User.findById(userId)
    if (!user) {
      return { error: 'Không tìm thấy người dùng' }
    }

    // Update apartment to available if user has one
    if (user.apartmentId && user.role === 'resident') {
      await Apartment.findByIdAndUpdate(user.apartmentId, {
        status: 'available'
      })
    }

    await User.findByIdAndDelete(userId)

    return { success: true, message: 'Xóa người dùng thành công' }
  } catch (error) {
    console.error('Delete user error:', error)
    return { error: 'Có lỗi xảy ra khi xóa người dùng' }
  }
}

export async function getAllUsers() {
  try {
    await connectDB()

    const users = await User.find()
      .populate('apartmentId', 'apartmentNumber building floor')
      .sort({ createdAt: -1 })
      .lean()

    const data = users.map((user: any) => ({
      id: user._id.toString(),
      email: user.email,
      full_name: user.fullName,
      fullName: user.fullName, // Keep both for compatibility
      phone: user.phone,
      role: user.role,
      status: user.status,
      apartment_id: user.apartmentId?._id?.toString(),
      apartment: user.apartmentId ? {
        id: user.apartmentId._id?.toString(),
        apartment_number: user.apartmentId.apartmentNumber,
        building: user.apartmentId.building,
        floor: user.apartmentId.floor
      } : null,
      created_at: user.createdAt?.toISOString()
    }))

    return { success: true, data }
  } catch (error) {
    console.error('Get all users error:', error)
    return { error: "Lỗi server khi lấy danh sách người dùng", data: [] }
  }
}

export async function getUserById(userId: string) {
  try {
    await connectDB()

    const user: any = await User.findById(userId)
      .populate('apartmentId', 'apartmentNumber building floor')
      .lean()

    if (!user) {
      return null
    }

    return {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      apartment: user.apartmentId ? {
        id: user.apartmentId._id?.toString(),
        apartmentNumber: user.apartmentId.apartmentNumber,
        building: user.apartmentId.building,
        floor: user.apartmentId.floor
      } : null,
      createdAt: user.createdAt?.toISOString()
    }
  } catch (error) {
    console.error('Get user by id error:', error)
    return null
  }
}
