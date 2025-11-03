import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/server"
import { toggleLike } from "@/lib/social/actions"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Người dùng chưa đăng nhập" },
        { status: 401 }
      )
    }

    const result = await toggleLike(params.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      liked: result.liked 
    })
  } catch (error) {
    console.error("[v0] Error in POST /api/posts/[id]/like:", error)
    return NextResponse.json(
      { error: "Lỗi server khi xử lý thích" },
      { status: 500 }
    )
  }
}
