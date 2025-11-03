import { NextRequest, NextResponse } from "next/server"
import { getApartmentById } from "@/lib/apartments/actions"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const apartment = await getApartmentById(id)

    if (!apartment) {
      return NextResponse.json(
        { error: "Căn hộ không tồn tại" },
        { status: 404 }
      )
    }

    return NextResponse.json(apartment)
  } catch (error) {
    console.error("[v0] Error in GET /api/apartments/[id]:", error)
    return NextResponse.json(
      { error: "Lỗi server khi lấy thông tin căn hộ" },
      { status: 500 }
    )
  }
}
