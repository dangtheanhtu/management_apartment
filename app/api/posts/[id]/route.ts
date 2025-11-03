import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/server"
import { updatePost, deletePost } from "@/lib/social/actions"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const post = await getPostById(id)
    
    if (!post) {
      return NextResponse.json(
        { error: "Bài đăng không tồn tại" },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("[v0] Error in GET /api/posts/[id]:", error)
    return NextResponse.json(
      { error: "Lỗi server khi lấy bài đăng" },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const { content, image_url, post_type, is_anonymous } = body

    const result = await updatePost(id, {
      content,
      image_url,
      post_type,
      is_anonymous
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in PUT /api/posts/[id]:", error)
    return NextResponse.json(
      { error: "Lỗi server khi cập nhật bài đăng" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    const result = await deletePost(id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in DELETE /api/posts/[id]:", error)
    return NextResponse.json(
      { error: "Lỗi server khi xóa bài đăng" },
      { status: 500 }
    )
  }
}
