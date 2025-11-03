import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/server"
import { connectDB } from "@/lib/mongodb/connection"
import { Post } from "@/lib/mongodb/models"

export async function POST(
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

    // Find the comment in the post's comments array
    const comment = post.comments.find((c: any) => c._id.toString() === commentId)
    
    if (!comment) {
      return NextResponse.json(
        { error: "Không tìm thấy bình luận" },
        { status: 404 }
      )
    }

    // Check if user already liked this comment
    const userLiked = comment.likes?.some((id: any) => id.toString() === user.id)
    
    let updatedPost
    if (userLiked) {
      // Remove like using $pull
      updatedPost = await Post.findOneAndUpdate(
        { _id: postId, 'comments._id': commentId },
        { $pull: { 'comments.$.likes': user.id } },
        { new: true }
      )
    } else {
      // Add like using $addToSet (prevents duplicates)
      updatedPost = await Post.findOneAndUpdate(
        { _id: postId, 'comments._id': commentId },
        { $addToSet: { 'comments.$.likes': user.id } },
        { new: true }
      )
    }

    if (!updatedPost) {
      return NextResponse.json(
        { error: "Không thể cập nhật" },
        { status: 500 }
      )
    }

    // Get updated comment to return new count
    const updatedComment = updatedPost.comments.find((c: any) => c._id.toString() === commentId)

    return NextResponse.json({
      success: true,
      liked: !userLiked,
      likes_count: updatedComment?.likes?.length || 0
    })
  } catch (error) {
    console.error("[v0] Error in POST /api/posts/[id]/comments/[commentId]/like:", error)
    return NextResponse.json(
      { error: "Lỗi server khi like bình luận" },
      { status: 500 }
    )
  }
}
