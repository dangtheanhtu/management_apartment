import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/server"
import { connectDB } from "@/lib/mongodb/connection"
import { ServiceRequest } from "@/lib/mongodb/models"
import { Message } from "@/lib/mongodb/models/Message"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: "Người dùng chưa đăng nhập" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const category = searchParams.get('category')

    await connectDB()

    let query: any = {}
    
    // Filter by user role
    if (user.role === 'resident') {
      query.userId = user.id
    }
    // Admin và staff có thể xem tất cả

    // Apply filters
    if (status) {
      query.status = status
    }
    if (category) {
      query.category = category
    }

    const skip = (page - 1) * limit
    
    const serviceRequests = await ServiceRequest.find(query)
      .populate('userId', 'fullName email phone')
      .populate('apartmentId', 'apartmentNumber building floor')
      .populate('assignedTo', 'fullName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Populate messages for each service request
    const requestsWithMessages = await Promise.all(
      serviceRequests.map(async (req: any) => {
        const messages = await Message.find({ serviceRequestId: req._id })
          .populate('sender', 'fullName email role')
          .sort({ createdAt: 1 })
          .lean()
        return { ...req, messages }
      })
    )

    const total = await ServiceRequest.countDocuments(query)

    return NextResponse.json({
      data: requestsWithMessages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error in GET /api/service-requests:", error)
    return NextResponse.json(
      { error: "Lỗi server khi lấy danh sách yêu cầu dịch vụ" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: "Người dùng chưa đăng nhập" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, category, images } = body
    
    console.log("Service request data received:", {
      title,
      description: description?.substring(0, 50) + '...',
      category,
      userId: user.id,
      userApartmentId: user.apartmentId,
      images: images?.length || 0
    })

    // Validation
    if (!title || !description || !category) {
      console.log("Validation failed - missing required fields:", {
        title: !!title,
        description: !!description,
        category: !!category
      })
      return NextResponse.json(
        { error: `Thiếu thông tin bắt buộc: ${!title ? 'tiêu đề, ' : ''}${!description ? 'mô tả, ' : ''}${!category ? 'danh mục' : ''}` },
        { status: 400 }
      )
    }

    // Check if user has apartmentId
    if (!user.apartmentId) {
      return NextResponse.json(
        { error: "Bạn chưa được gán căn hộ. Vui lòng liên hệ quản lý." },
        { status: 400 }
      )
    }

    const validCategories = ['plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'other']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Danh mục không hợp lệ" },
        { status: 400 }
      )
    }

    await connectDB()

    const serviceRequest = new ServiceRequest({
      userId: user.id,
      title: title.trim(),
      description: description.trim(),
      category,
      apartmentId: user.apartmentId, // Tự động lấy từ user
      status: 'pending',
      images: Array.isArray(images) ? images : []
    })

    await serviceRequest.save()
    
    // Populate data for response
    await serviceRequest.populate('userId', 'fullName email phone')
    await serviceRequest.populate('apartmentId', 'apartmentNumber building floor')

    console.log("Service request created successfully:", serviceRequest._id)

    return NextResponse.json(serviceRequest)

  } catch (error) {
    console.error("Error in POST /api/service-requests:", error)
    return NextResponse.json(
      { error: "Lỗi server khi tạo yêu cầu dịch vụ" },
      { status: 500 }
    )
  }
}
