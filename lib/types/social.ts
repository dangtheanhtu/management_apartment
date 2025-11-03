export type PostType = 'general' | 'announcement' | 'event' | 'complaint' | 'suggestion'

export interface Post {
  id: string
  user_id: string
  content: string
  image_url?: string | null
  post_type: PostType
  is_pinned: boolean
  is_anonymous: boolean
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  parent_comment_id?: string | null
  created_at: string
  updated_at: string
}

export interface Like {
  id: string
  user_id: string
  post_id?: string | null
  comment_id?: string | null
  created_at: string
}

export interface PostDetail extends Post {
  user: {
    id: string
    full_name: string
    email: string
    avatar_url?: string | null
  }
  comments: CommentDetail[]
  likes: Like[]
  likes_count: number
  comments_count: number
  user_liked: boolean
}

export interface CommentDetail extends Comment {
  user: {
    id: string
    full_name: string
    email: string
    avatar_url?: string | null
  }
  replies: CommentDetail[]
  likes: Like[]
  likes_count: number
  user_liked: boolean
}

export interface CreatePostRequest {
  content: string
  image_url?: string
  post_type: PostType
  is_anonymous?: boolean
}

export interface CreateCommentRequest {
  post_id: string
  content: string
  parent_comment_id?: string
}

export interface PostStats {
  likes_count: number
  comments_count: number
}

// Helper functions for display
export function getPostTypeDisplayName(type: PostType): string {
  const typeNames: Record<PostType, string> = {
    'general': 'Chia sẻ',
    'announcement': 'Thông báo',
    'event': 'Sự kiện',
    'complaint': 'Khiếu nại',
    'suggestion': 'Góp ý'
  }
  return typeNames[type] || type
}

export function getPostTypeColor(type: PostType): string {
  const colors: Record<PostType, string> = {
    'general': 'bg-blue-100 text-blue-800',
    'announcement': 'bg-red-100 text-red-800',
    'event': 'bg-green-100 text-green-800',
    'complaint': 'bg-orange-100 text-orange-800',
    'suggestion': 'bg-purple-100 text-purple-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

export function getPostTypeIcon(type: PostType): string {
  const icons: Record<PostType, string> = {
    'general': '💬',
    'announcement': '📢',
    'event': '🎉',
    'complaint': '⚠️',
    'suggestion': '💡'
  }
  return icons[type] || '💬'
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Vừa xong'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} tuần trước`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} năm trước`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
