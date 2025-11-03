import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb/connection'
import { Apartment } from '@/lib/mongodb/models'
import { handleAPIError, createSuccessResponse } from '@/lib/api/error-handler'

export async function GET() {
  try {
    await connectDB()
    const apartments = await Apartment.find({})
      .sort({ building: 1, floor: 1, apartmentNumber: 1 })
      .lean()
    
    // Format data to match expected structure
    const formattedApartments = apartments.map((apartment: any) => ({
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
    
    return createSuccessResponse({ apartments: formattedApartments })
  } catch (error) {
    return handleAPIError(error)
  }
}



