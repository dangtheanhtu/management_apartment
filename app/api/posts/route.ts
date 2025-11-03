import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/server"
import { connectDB } from "@/lib/mongodb/connection"
import { Post } from "@/lib/mongodb/models"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Get current user to check if they liked posts
    const currentUser = await getCurrentUser()
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const postType = searchParams.get('post_type')

    let query: any = {}
    if (postType) {
      query.postType = postType
    }

    const skip = (page - 1) * limit
    
    const posts = await Post.find(query)
      .populate('userId', 'fullName email avatarUrl')
      .populate('comments.userId', 'fullName email avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Post.countDocuments(query)

    // Transform posts to match frontend expectations
    const transformedPosts = posts.map(post => {
      const postObj = post.toObject() as any
      
      // Check if current user liked this post
      const userLiked = currentUser ? 
        postObj.likes?.some((likeId: any) => likeId.toString() === currentUser.id.toString()) : 
        false
      
      return {
        id: postObj._id.toString(),
        _id: postObj._id,
        content: postObj.content,
        image_url: postObj.imageUrl,
        post_type: postObj.postType,
        is_anonymous: postObj.isAnonymous,
        is_pinned: false, // TODO: Add pinned field to model
        user: postObj.userId ? {
          id: postObj.userId._id?.toString(),
          full_name: postObj.userId.fullName,
          email: postObj.userId.email,
          avatar_url: postObj.userId.avatarUrl
        } : null,
        likes: postObj.likes || [],
        likes_count: postObj.likes?.length || 0,
        comments_count: postObj.comments?.length || 0,
        user_liked: userLiked,
        comments: postObj.comments?.map((comment: any) => {
          // Check if current user liked this comment
          const commentUserLiked = currentUser ? 
            comment.likes?.some((likeId: any) => likeId.toString() === currentUser.id.toString()) : 
            false
          
          return {
            id: comment._id?.toString(),
            _id: comment._id,
            content: comment.content,
            parent_comment_id: comment.parentCommentId,
            likes_count: comment.likes?.length || 0,
            user_liked: commentUserLiked,
            created_at: comment.createdAt,
            user: comment.userId ? {
              id: comment.userId._id?.toString(),
              full_name: comment.userId.fullName,
              email: comment.userId.email,
              avatar_url: comment.userId.avatarUrl
            } : null
          }
        }) || [],
        created_at: postObj.createdAt,
        updated_at: postObj.updatedAt
      }
    })

    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error in GET /api/posts:", error)
    return NextResponse.json(
      { error: "Lỗi server khi lấy danh sách bài đăng" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[POST /api/posts] Starting...')
    const user = await getCurrentUser()
    console.log('[POST /api/posts] User:', user)
    
    if (!user) {
      console.log('[POST /api/posts] No user found')
      return NextResponse.json(
        { error: "Người dùng chưa đăng nhập" },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('[POST /api/posts] Request body:', body)
    
    // Accept both snake_case and camelCase
    const content = body.content
    const imageUrl = body.imageUrl || body.image_url
    const postType = body.postType || body.post_type
    const isAnonymous = body.isAnonymous !== undefined ? body.isAnonymous : body.is_anonymous

    // Validation
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: "Nội dung bài đăng không được để trống" },
        { status: 400 }
      )
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: "Nội dung bài đăng không được để trống" },
        { status: 400 }
      )
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: "Nội dung bài đăng không được vượt quá 2000 ký tự" },
        { status: 400 }
      )
    }

    if (!postType || typeof postType !== 'string') {
      return NextResponse.json(
        { error: "Loại bài đăng không hợp lệ" },
        { status: 400 }
      )
    }

    const validPostTypes = ['general', 'announcement', 'event', 'complaint', 'suggestion']
    if (!validPostTypes.includes(postType)) {
      return NextResponse.json(
        { error: "Loại bài đăng không hợp lệ" },
        { status: 400 }
      )
    }

    await connectDB()

    const post = new Post({
      userId: user.id,
      content: content.trim(),
      imageUrl,
      postType,
      isAnonymous: isAnonymous || false,
      likes: [],
      comments: []
    })

    await post.save()
    
    // Populate user data for response
    await post.populate('userId', 'fullName email avatarUrl')

    // Transform to match frontend expectations
    const postObj = post.toObject() as any
    const transformedPost = {
      id: postObj._id.toString(),
      _id: postObj._id,
      content: postObj.content,
      image_url: postObj.imageUrl,
      post_type: postObj.postType,
      is_anonymous: postObj.isAnonymous,
      is_pinned: false,
      user: postObj.userId ? {
        id: postObj.userId._id?.toString(),
        full_name: postObj.userId.fullName,
        email: postObj.userId.email,
        avatar_url: postObj.userId.avatarUrl
      } : null,
      likes: postObj.likes || [],
      likes_count: postObj.likes?.length || 0,
      comments_count: postObj.comments?.length || 0,
      user_liked: false,
      comments: [],
      created_at: postObj.createdAt,
      updated_at: postObj.updatedAt
    }

    return NextResponse.json(transformedPost)
  } catch (error) {
    console.error("Error in POST /api/posts:", error)
    return NextResponse.json(
      { error: "Lỗi server khi tạo bài đăng" },
      { status: 500 }
    )
  }
}
