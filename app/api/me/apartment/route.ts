import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/actions"
import connectToDatabase from "@/lib/mongodb/connection"
import { Apartment } from "@/lib/mongodb/models/Apartment"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: "Người dùng chưa đăng nhập" },
        { status: 401 }
      )
    }

    await connectToDatabase()

    // Tìm căn hộ mà user này là resident
    const apartment = await Apartment.findOne({ 
      resident: user.id 
    }).lean()

    if (!apartment) {
      return NextResponse.json(
        { error: "Không tìm thấy thông tin căn hộ" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: apartment._id.toString(),
      apartment_number: apartment.apartmentNumber,
      building: apartment.building,
      floor: apartment.floor,
      area_sqm: apartment.area,
      rent_amount: apartment.rentPrice
    })

  } catch (error) {
    console.error("Error in GET /api/me/apartment:", error)
    return NextResponse.json(
      { error: "Lỗi server khi lấy thông tin căn hộ" },
      { status: 500 }
    )
  }
}
