"use server"

import { connectDB } from "@/lib/mongodb/connection"
import { User } from "@/lib/mongodb/models"
import { getCurrentUser } from "@/lib/auth/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function uploadAvatar(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Người dùng chưa đăng nhập" }
    }

    const file = formData.get('avatar') as File
    if (!file) {
      return { error: "Không có file được chọn" }
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { error: "Chỉ hỗ trợ định dạng ảnh: JPEG, PNG, GIF, WebP" }
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return { error: "Kích thước file không được vượt quá 5MB" }
    }

    // Create upload directory if not exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const ext = path.extname(file.name)
    const filename = `avatar_${user.id}_${timestamp}_${randomString}${ext}`
    const filepath = path.join(uploadDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Update user avatar URL in database
    const avatarUrl = `/uploads/avatars/${filename}`
    
    await connectDB()
    await User.findByIdAndUpdate(user.id, { avatarUrl })

    return { 
      success: true, 
      avatarUrl 
    }
  } catch (error) {
    console.error("Error uploading avatar:", error)
    return { error: "Lỗi server khi tải avatar lên" }
  }
}

export async function updateProfile(data: {
  fullName?: string
  phone?: string
  email?: string
}) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Người dùng chưa đăng nhập" }
    }

    await connectDB()

    const updateData: any = {}
    if (data.fullName) updateData.fullName = data.fullName
    if (data.phone) updateData.phone = data.phone
    if (data.email) {
      // Check if email already exists
      const existingUser = await User.findOne({ 
        email: data.email,
        _id: { $ne: user.id }
      })
      if (existingUser) {
        return { error: "Email đã được sử dụng bởi tài khoản khác" }
      }
      updateData.email = data.email
    }

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      updateData,
      { new: true }
    ).select('-password')

    return {
      success: true,
      user: {
        id: updatedUser._id.toString(),
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl
      }
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { error: "Lỗi server khi cập nhật thông tin" }
  }
}

export async function getProfile() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Người dùng chưa đăng nhập" }
    }

    await connectDB()

    const profile = await User.findById(user.id)
      .select('-password')
      .populate('apartmentId', 'unitNumber building floor')

    if (!profile) {
      return { error: "Không tìm thấy thông tin người dùng" }
    }

    return {
      success: true,
      profile: {
        id: profile._id.toString(),
        email: profile.email,
        fullName: profile.fullName,
        phone: profile.phone,
        role: profile.role,
        status: profile.status,
        avatarUrl: profile.avatarUrl,
        apartment: profile.apartmentId ? {
          id: (profile.apartmentId as any)._id.toString(),
          unitNumber: (profile.apartmentId as any).unitNumber,
          building: (profile.apartmentId as any).building,
          floor: (profile.apartmentId as any).floor
        } : null,
        createdAt: profile.createdAt
      }
    }
  } catch (error) {
    console.error("Error getting profile:", error)
    return { error: "Lỗi server khi lấy thông tin người dùng" }
  }
}

export async function updateUserPreferences(preferences: any) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Người dùng chưa đăng nhập" }
    }

    await connectDB()

    // For now, just return success since we don't have preferences model
    // You can add a UserPreferences model later
    return { success: true }
  } catch (error) {
    console.error("Error updating preferences:", error)
    return { error: "Lỗi server khi cập nhật tùy chọn" }
  }
}
