"use server"

import { connectDB } from "@/lib/mongodb/connection"
import { Post } from "@/lib/mongodb/models"
import { getCurrentUser } from "@/lib/auth/server"

export async function createComment(postId: string, content: string, parentCommentId?: string | null) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Người dùng chưa đăng nhập" }
    }

    if (!content || content.trim().length === 0) {
      return { error: "Nội dung bình luận không được để trống" }
    }

    await connectDB()

    const post = await Post.findById(postId)
    if (!post) {
      return { error: "Không tìm thấy bài đăng" }
    }

    post.comments.push({
      userId: user.id,
      content: content.trim(),
      parentCommentId: parentCommentId || null,
      likes: [],
      createdAt: new Date()
    } as any)
    
    await post.save()

    // Populate user data for all comments
    await post.populate('comments.userId', 'fullName email avatarUrl')
    
    // Get the newly added comment with populated user
    const newComment = post.comments[post.comments.length - 1] as any
    
    // Transform to match frontend expectations
    const transformedComment = {
      _id: newComment._id,
      content: newComment.content,
      parent_comment_id: newComment.parentCommentId,
      likes_count: newComment.likes?.length || 0,
      created_at: newComment.createdAt,
      user: newComment.userId ? {
        full_name: newComment.userId.fullName,
        email: newComment.userId.email,
        avatar_url: newComment.userId.avatarUrl
      } : null
    }

    return { 
      success: true, 
      comment: transformedComment,
      commentCount: post.comments.length 
    }
  } catch (error) {
    console.error("Error creating comment:", error)
    return { error: "Lỗi server khi tạo bình luận" }
  }
}

export async function likePost(postId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Người dùng chưa đăng nhập" }
    }

    await connectDB()

    const post = await Post.findById(postId)
    if (!post) {
      return { error: "Không tìm thấy bài đăng" }
    }

    const userIdStr = user.id.toString()
    const likeIndex = post.likes.findIndex((id: any) => id.toString() === userIdStr)

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1)
    } else {
      // Like
      post.likes.push(user.id)
    }

    await post.save()

    return { 
      success: true, 
      liked: likeIndex === -1,
      likeCount: post.likes.length 
    }
  } catch (error) {
    console.error("Error liking post:", error)
    return { error: "Lỗi server khi thích bài đăng" }
  }
}

export async function toggleLike(postId: string) {
  return likePost(postId)
}

export async function deletePost(postId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Người dùng chưa đăng nhập" }
    }

    await connectDB()

    const post = await Post.findById(postId)
    if (!post) {
      return { error: "Không tìm thấy bài đăng" }
    }

    // Check if user is the owner or admin
    if (post.userId.toString() !== user.id.toString() && user.role !== 'admin') {
      return { error: "Bạn không có quyền xóa bài đăng này" }
    }

    await Post.findByIdAndDelete(postId)

    return { success: true }
  } catch (error) {
    console.error("Error deleting post:", error)
    return { error: "Lỗi server khi xóa bài đăng" }
  }
}

export async function updatePost(postId: string, data: { content: string; imageUrl?: string }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Người dùng chưa đăng nhập" }
    }

    if (!data.content || data.content.trim().length === 0) {
      return { error: "Nội dung bài đăng không được để trống" }
    }

    await connectDB()

    const post = await Post.findById(postId)
    if (!post) {
      return { error: "Không tìm thấy bài đăng" }
    }

    // Check if user is the owner or admin
    if (post.userId.toString() !== user.id.toString() && user.role !== 'admin') {
      return { error: "Bạn không có quyền sửa bài đăng này" }
    }

    post.content = data.content.trim()
    if (data.imageUrl !== undefined) {
      post.imageUrl = data.imageUrl
    }

    await post.save()
    await post.populate('userId', 'fullName email avatarUrl')

    // Transform to match frontend expectations
    const postObj = post.toObject() as any
    const transformedPost = {
      ...postObj,
      user: postObj.userId ? {
        full_name: postObj.userId.fullName,
        email: postObj.userId.email,
        avatar_url: postObj.userId.avatarUrl
      } : null,
      userId: postObj.userId?._id
    }

    return { success: true, post: transformedPost }
  } catch (error) {
    console.error("Error updating post:", error)
    return { error: "Lỗi server khi cập nhật bài đăng" }
  }
}
