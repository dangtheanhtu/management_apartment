import { NextRequest, NextResponse } from "next/server"
import { getAmenityById } from "@/lib/amenities/actions"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const amenity = await getAmenityById(id)

    if (!amenity) {
      return NextResponse.json(
        { error: "Tiện ích không tồn tại" },
        { status: 404 }
      )
    }

    return NextResponse.json(amenity)
  } catch (error) {
    console.error("[v0] Error in GET /api/amenities/[id]:", error)
    return NextResponse.json(
      { error: "Lỗi server khi lấy thông tin tiện ích" },
      { status: 500 }
    )
  }
}
