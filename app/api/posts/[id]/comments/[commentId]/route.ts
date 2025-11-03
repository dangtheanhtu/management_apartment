import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/server"
import { connectDB } from "@/lib/mongodb/connection"
import { Post } from "@/lib/mongodb/models"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Người dùng chưa đăng nhập" },
        { status: 401 }
      )
    }

    const { id: postId, commentId } = await params

    await connectDB()

    const post = await Post.findById(postId)
    
    if (!post) {
      return NextResponse.json(
        { error: "Không tìm thấy bài đăng" },
        { status: 404 }
      )
    }

    // Find the comment
    const comment = post.comments.find((c: any) => c._id.toString() === commentId)
    
    if (!comment) {
      return NextResponse.json(
        { error: "Không tìm thấy bình luận" },
        { status: 404 }
      )
    }

    // Check permission: owner or admin
    if (comment.userId.toString() !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: "Bạn không có quyền xóa bình luận này" },
        { status: 403 }
      )
    }

    // Remove comment using $pull
    await Post.findByIdAndUpdate(
      postId,
      { $pull: { comments: { _id: commentId } } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in DELETE /api/posts/[id]/comments/[commentId]:", error)
    return NextResponse.json(
      { error: "Lỗi server khi xóa bình luận" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Người dùng chưa đăng nhập" },
        { status: 401 }
      )
    }

    const { id: postId, commentId } = await params
    const body = await request.json()
    const { content } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Nội dung bình luận không được để trống" },
        { status: 400 }
      )
    }

    await connectDB()

    const post = await Post.findById(postId)
    
    if (!post) {
      return NextResponse.json(
        { error: "Không tìm thấy bài đăng" },
        { status: 404 }
      )
    }

    // Find the comment
    const comment = post.comments.find((c: any) => c._id.toString() === commentId)
    
    if (!comment) {
      return NextResponse.json(
        { error: "Không tìm thấy bình luận" },
        { status: 404 }
      )
    }

    // Check permission: owner or admin
    if (comment.userId.toString() !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: "Bạn không có quyền sửa bình luận này" },
        { status: 403 }
      )
    }

    // Update comment using positional operator
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId, 'comments._id': commentId },
      { $set: { 'comments.$.content': content.trim() } },
      { new: true }
    ).populate('comments.userId', 'fullName email avatarUrl')

    if (!updatedPost) {
      return NextResponse.json(
        { error: "Không thể cập nhật bình luận" },
        { status: 500 }
      )
    }

    // Get updated comment
    const updatedComment = updatedPost.comments.find((c: any) => c._id.toString() === commentId)

    if (!updatedComment) {
      return NextResponse.json(
        { error: "Không tìm thấy bình luận sau khi cập nhật" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      comment: {
        id: updatedComment._id,
        content: updatedComment.content,
        updated_at: new Date()
      }
    })
  } catch (error) {
    console.error("[v0] Error in PUT /api/posts/[id]/comments/[commentId]:", error)
    return NextResponse.json(
      { error: "Lỗi server khi cập nhật bình luận" },
      { status: 500 }
    )
  }
}
