import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb/connection"
import { Apartment, Post } from "@/lib/mongodb/models"
import { getAmenities } from "@/lib/amenities/actions"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const searchParams = request.nextUrl.searchParams
    const availableUnitsLimit = parseInt(searchParams.get('units_limit') || '6')
    const amenitiesLimit = parseInt(searchParams.get('amenities_limit') || '6')
    const newsLimit = parseInt(searchParams.get('news_limit') || '4')

    // Fetch available apartments
    const apartments = await Apartment.find({ status: 'available' })
      .sort({ updatedAt: -1 })
      .limit(availableUnitsLimit)
      .lean()

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
      createdAt: apartment.createdAt?.toISOString(),
      updatedAt: apartment.updatedAt?.toISOString()
    }))

    // Fetch amenities
    const amenities = await getAmenities()
    const activeAmenities = amenities
      .filter(a => a.status === 'active' || a.status === 'available')
      .slice(0, amenitiesLimit)

    // Fetch news/posts (announcement, event types)
    const posts = await Post.find({ 
      postType: { $in: ['announcement', 'event', 'general'] }
    })
      .populate('userId', 'fullName email avatarUrl')
      .sort({ createdAt: -1 })
      .limit(newsLimit)
      .lean()

    const formattedPosts = posts.map((post: any) => ({
      id: post._id.toString(),
      content: post.content,
      imageUrl: post.imageUrl,
      postType: post.postType,
      isAnonymous: post.isAnonymous,
      user: post.userId ? {
        id: post.userId._id?.toString(),
        fullName: post.userId.fullName,
        email: post.userId.email,
        avatarUrl: post.userId.avatarUrl
      } : null,
      likesCount: post.likes?.length || 0,
      commentsCount: post.comments?.length || 0,
      createdAt: post.createdAt?.toISOString()
    }))

    // Stats for overview
    const totalApartments = await Apartment.countDocuments()
    const availableCount = await Apartment.countDocuments({ status: 'available' })
    const occupiedCount = await Apartment.countDocuments({ status: 'occupied' })

    return NextResponse.json({
      apartments: formattedApartments,
      amenities: activeAmenities,
      posts: formattedPosts,
      stats: {
        totalApartments,
        totalResidents: occupiedCount * 2, // Estimate 2 residents per occupied apartment
        totalAmenities: amenities.length,
        availableCount,
        occupiedCount,
        occupancyRate: totalApartments > 0 
          ? Math.round((occupiedCount / totalApartments) * 100) 
          : 0,
        activeAmenities: activeAmenities.length
      }
    })
  } catch (error) {
    console.error("Error in GET /api/home:", error)
    return NextResponse.json(
      { 
        error: "Lỗi server khi lấy dữ liệu trang chủ",
        apartments: [],
        amenities: [],
        posts: [],
        stats: null
      },
      { status: 500 }
    )
  }
}
