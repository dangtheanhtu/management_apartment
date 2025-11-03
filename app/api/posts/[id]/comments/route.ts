import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/server"
import { createComment } from "@/lib/social/actions"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Người dùng chưa đăng nhập" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { content, parent_comment_id } = body

    if (!content) {
      return NextResponse.json(
        { error: "Nội dung bình luận không được để trống" },
        { status: 400 }
      )
    }

    const result = await createComment(id, content, parent_comment_id)

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error in POST /api/posts/[id]/comments:", error)
    return NextResponse.json(
      { error: "Lỗi server khi tạo bình luận" },
      { status: 500 }
    )
  }
}
