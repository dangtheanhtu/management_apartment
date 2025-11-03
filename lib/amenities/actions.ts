'use server'

import { connectDB } from '@/lib/mongodb/connection'
import { Amenity } from '@/lib/mongodb/models'

export async function getAmenities() {
  try {
    await connectDB()

    const amenities = await Amenity.find()
      .sort({ name: 1 })
      .lean()

    console.log('Raw amenities from DB:', amenities.map(a => ({
      name: a.name,
      imageUrl: a.imageUrl,
      hasImageUrl: !!a.imageUrl
    })))

    return amenities.map((amenity: any) => ({
      id: amenity._id.toString(),
      name: amenity.name,
      type: amenity.type,
      description: amenity.description,
      location: amenity.location,
      capacity: amenity.capacity,
      operating_hours: amenity.operatingHours,
      operatingHours: amenity.operatingHours,
      bookingRequired: amenity.bookingRequired,
      pricing: amenity.pricing,
      status: amenity.status,
      imageUrl: amenity.imageUrl || null,
      images: amenity.images || [],
      createdAt: amenity.createdAt?.toISOString()
    }))
  } catch (error) {
    console.error('Get amenities error:', error)
    return []
  }
}

export async function getAmenityById(amenityId: string) {
  try {
    await connectDB()

    const amenity = await Amenity.findById(amenityId).lean()

    if (!amenity) {
      return null
    }

    return {
      id: amenity._id.toString(),
      name: amenity.name,
      type: amenity.type,
      description: amenity.description,
      location: amenity.location,
      capacity: amenity.capacity,
      operating_hours: amenity.operatingHours,
      operatingHours: amenity.operatingHours,
      bookingRequired: amenity.bookingRequired,
      pricing: amenity.pricing,
      status: amenity.status,
      imageUrl: amenity.imageUrl || null,
      images: amenity.images || [],
      createdAt: amenity.createdAt?.toISOString()
    }
  } catch (error) {
    console.error('Get amenity by id error:', error)
    return null
  }
}

interface CreateAmenityData {
  name: string
  type: string
  description: string
  location?: string
  operatingHours?: string
  status: string
  imageUrl?: string
}

export async function createAmenity(data: CreateAmenityData) {
  try {
    await connectDB()

    const { name, type, description, location, operatingHours, status, imageUrl } = data

    console.log('Creating amenity with data:', {
      name,
      type,
      description,
      location,
      operatingHours,
      status,
      imageUrl,
      hasImageUrl: !!imageUrl
    })

    if (!name || !type) {
      return { error: 'Vui lòng điền đầy đủ thông tin bắt buộc' }
    }

    const amenityData = {
      name,
      type,
      description: description || undefined,
      location: location || undefined,
      operatingHours: operatingHours || undefined,
      status: status || 'active',
      imageUrl: imageUrl && imageUrl.trim() !== '' ? imageUrl : undefined,
      images: []
    }

    console.log('Amenity data to save:', amenityData)

    const amenity = await Amenity.create(amenityData)

    console.log('Amenity created in DB:', {
      _id: amenity._id,
      name: amenity.name,
      imageUrl: amenity.imageUrl,
      hasImageUrl: !!amenity.imageUrl
    })

    return {
      success: true,
      message: 'Tạo tiện ích thành công',
      amenityId: amenity._id.toString()
    }
  } catch (error) {
    console.error('Create amenity error:', error)
    return { error: 'Có lỗi xảy ra khi tạo tiện ích' }
  }
}

export async function deleteAmenity(amenityId: string) {
  try {
    await connectDB()
    await Amenity.findByIdAndDelete(amenityId)
    return { success: true, message: 'Xóa tiện ích thành công' }
  } catch (error) {
    console.error('Delete amenity error:', error)
    return { error: 'Có lỗi xảy ra khi xóa tiện ích' }
  }
}

interface UpdateAmenityData {
  name: string
  type?: string
  description: string
  location?: string
  operatingHours?: string
  status: string
  imageUrl?: string
}

export async function updateAmenity(amenityId: string, data: UpdateAmenityData) {
  try {
    await connectDB()

    const { name, type, description, location, operatingHours, status, imageUrl } = data

    const updateData: any = {}
    if (name) updateData.name = name
    if (type) updateData.type = type
    if (description !== undefined) updateData.description = description
    if (location !== undefined) updateData.location = location
    if (operatingHours !== undefined) updateData.operatingHours = operatingHours
    if (status) updateData.status = status
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl

    await Amenity.findByIdAndUpdate(amenityId, updateData, { new: true })

    return { success: true, message: 'Cập nhật tiện ích thành công' }
  } catch (error) {
    console.error('Update amenity error:', error)
    return { error: 'Có lỗi xảy ra khi cập nhật tiện ích' }
  }
}
