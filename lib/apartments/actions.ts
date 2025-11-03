'use server'

import { connectDB } from '@/lib/mongodb/connection'
import { Apartment, User } from '@/lib/mongodb/models'
import { apartmentSchema, type ApartmentFormData } from '@/lib/validations/schemas'
import { isValidObjectId, paginate, type PaginatedResult } from '@/lib/mongodb/helpers'

export async function createApartment(data: FormData | any) {
  try {
    await connectDB()

    // Support both FormData and plain object
    const getData = (key: string) => {
      if (data instanceof FormData) {
        return data.get(key)
      }
      return data[key]
    }

    const apartmentData: ApartmentFormData = {
      apartmentNumber: getData('apartmentNumber') as string,
      floor: parseInt(getData('floor') as string),
      building: getData('building') as string,
      area: parseFloat(getData('area') as string),
      bedrooms: parseInt(getData('bedrooms') as string),
      bathrooms: parseInt(getData('bathrooms') as string),
      rentPrice: parseFloat(getData('rentPrice') as string),
      status: getData('status') as 'available' | 'occupied' | 'maintenance',
      description: getData('description') as string || undefined,
      images: Array.isArray(getData('images')) ? getData('images') : []
    }

    // Validate with Zod
    const validated = apartmentSchema.parse(apartmentData)

    // Check if apartment number exists
    const existing = await Apartment.findOne({ apartmentNumber: validated.apartmentNumber })
    if (existing) {
      return { error: 'Số căn hộ đã tồn tại' }
    }

    // Create apartment
    const apartment = await Apartment.create({
      ...validated,
      amenities: [],
    })

    console.log('[CREATE APARTMENT] Created:', apartment._id)

    return {
      success: true,
      message: 'Tạo căn hộ thành công',
      apartmentId: apartment._id.toString()
    }
  } catch (error: any) {
    console.error('Create apartment error:', error)
    if (error.name === 'ZodError') {
      return { error: error.errors[0]?.message || 'Dữ liệu không hợp lệ' }
    }
    return { error: 'Có lỗi xảy ra khi tạo căn hộ' }
  }
}

export async function updateApartment(apartmentId: string, data: FormData | any) {
  try {
    await connectDB()

    if (!isValidObjectId(apartmentId)) {
      return { error: 'ID căn hộ không hợp lệ' }
    }

    // Support both FormData and plain object
    const getData = (key: string) => {
      if (data instanceof FormData) {
        return data.get(key)
      }
      return data[key]
    }

    const apartmentData: ApartmentFormData = {
      apartmentNumber: getData('apartmentNumber') as string,
      floor: parseInt(getData('floor') as string),
      building: getData('building') as string,
      area: parseFloat(getData('area') as string),
      bedrooms: parseInt(getData('bedrooms') as string),
      bathrooms: parseInt(getData('bathrooms') as string),
      rentPrice: parseFloat(getData('rentPrice') as string),
      status: getData('status') as 'available' | 'occupied' | 'maintenance',
      description: getData('description') as string || undefined,
      images: Array.isArray(getData('images')) ? getData('images') : []
    }

    // Validate with Zod
    const validated = apartmentSchema.parse(apartmentData)

    const updated = await Apartment.findByIdAndUpdate(
      apartmentId,
      { $set: validated },
      { new: true, runValidators: true }
    )

    if (!updated) {
      return { error: 'Căn hộ không tồn tại' }
    }

    return { success: true, message: 'Cập nhật căn hộ thành công' }
  } catch (error: any) {
    console.error('Update apartment error:', error)
    if (error.name === 'ZodError') {
      return { error: error.errors[0]?.message || 'Dữ liệu không hợp lệ' }
    }
    return { error: 'Có lỗi xảy ra khi cập nhật căn hộ' }
  }
}

export async function deleteApartment(apartmentId: string) {
  try {
    await connectDB()

    if (!isValidObjectId(apartmentId)) {
      return { error: 'ID căn hộ không hợp lệ' }
    }

    // Check if apartment is occupied
    const resident = await User.findOne({ apartmentId, role: 'resident' })
    if (resident) {
      return { error: 'Không thể xóa căn hộ đang có cư dân' }
    }

    const deleted = await Apartment.findByIdAndDelete(apartmentId)

    if (!deleted) {
      return { error: 'Căn hộ không tồn tại' }
    }

    return { success: true, message: 'Xóa căn hộ thành công' }
  } catch (error) {
    console.error('Delete apartment error:', error)
    return { error: 'Có lỗi xảy ra khi xóa căn hộ' }
  }
}

export async function getAllApartments() {
  try {
    await connectDB()

    const apartments = await Apartment.find()
      .sort({ building: 1, floor: 1, apartmentNumber: 1 })
      .lean()

    return apartments.map((apartment: any) => ({
      id: apartment._id.toString(),
      apartmentNumber: apartment.apartmentNumber,
      floor: apartment.floor,
      building: apartment.building,
      area: apartment.area,
      bedrooms: apartment.bedrooms,
      bathrooms: apartment.bathrooms,
      rentPrice: apartment.rentPrice,
      status: apartment.status,
      description: apartment.description,
      imageUrl: apartment.imageUrl,
      amenities: apartment.amenities || [],
      images: apartment.images || [],
      createdAt: apartment.createdAt?.toISOString()
    }))
  } catch (error) {
    console.error('Get all apartments error:', error)
    return []
  }
}

export async function getPaginatedApartments(page: number = 1, limit: number = 10, filters?: any) {
  try {
    await connectDB()

    const filter: any = {}
    
    if (filters?.status) {
      filter.status = filters.status
    }
    
    if (filters?.building) {
      filter.building = filters.building
    }

    if (filters?.minPrice || filters?.maxPrice) {
      filter.rentPrice = {}
      if (filters.minPrice) filter.rentPrice.$gte = filters.minPrice
      if (filters.maxPrice) filter.rentPrice.$lte = filters.maxPrice
    }

    const result = await paginate<Apartment>(Apartment, filter, {
      page,
      limit,
      sort: { building: 1, floor: 1, apartmentNumber: 1 }
    })

    return {
      ...result,
      data: result.data.map((apartment: any) => ({
        id: apartment._id.toString(),
        apartmentNumber: apartment.apartmentNumber,
        floor: apartment.floor,
        building: apartment.building,
        area: apartment.area,
        bedrooms: apartment.bedrooms,
        bathrooms: apartment.bathrooms,
        rentPrice: apartment.rentPrice,
        status: apartment.status,
        description: apartment.description,
        amenities: apartment.amenities || [],
        images: apartment.images || [],
        createdAt: apartment.createdAt?.toISOString()
      }))
    }
  } catch (error) {
    console.error('Get paginated apartments error:', error)
    return {
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    }
  }
}

export async function getApartmentById(apartmentId: string) {
  try {
    await connectDB()

    if (!isValidObjectId(apartmentId)) {
      return null
    }

    const apartment: any = await Apartment.findById(apartmentId).lean()

    if (!apartment) {
      return null
    }

    return {
      id: apartment._id.toString(),
      apartmentNumber: apartment.apartmentNumber,
      floor: apartment.floor,
      building: apartment.building,
      area: apartment.area,
      bedrooms: apartment.bedrooms,
      bathrooms: apartment.bathrooms,
      rentPrice: apartment.rentPrice,
      status: apartment.status,
      description: apartment.description,
      imageUrl: apartment.imageUrl,
      amenities: apartment.amenities || [],
      images: apartment.images || [],
      createdAt: apartment.createdAt?.toISOString()
    }
  } catch (error) {
    console.error('Get apartment by id error:', error)
    return null
  }
}

export type Apartment = {
  id: string
  apartmentNumber: string
  floor: number
  building: string
  area: number
  bedrooms: number
  bathrooms: number
  rentPrice: number
  status: 'available' | 'occupied' | 'maintenance'
  description?: string
  imageUrl?: string
  amenities: string[]
  images: string[]
  createdAt?: string
}
