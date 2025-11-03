"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  MoreHorizontal,
  Plus,
  Pin,
  AlertCircle,
  Send,
  Reply,
  Trash2,
  Edit2,
  Camera,
  X,
  Image as ImageIcon
} from "lucide-react"
import type { PostDetail, CreatePostRequest, PostType } from "@/lib/types/social"
import { 
  getPostTypeDisplayName, 
  getPostTypeColor, 
  getPostTypeIcon, 
  formatTimeAgo, 
  getInitials 
} from "@/lib/types/social"

export default function CommunityPage() {
  const [posts, setPosts] = useState<PostDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newPost, setNewPost] = useState<CreatePostRequest>({
    content: '',
    post_type: 'general',
    is_anonymous: false
  })
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [showAllComments, setShowAllComments] = useState<Record<string, boolean>>({})
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({})
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<PostType | 'all'>('all')
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [editPostContent, setEditPostContent] = useState<string>('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editCommentContent, setEditCommentContent] = useState<string>('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [viewingImage, setViewingImage] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/me')
      if (response.ok) {
        const data = await response.json()
        console.log('[DEBUG] Current user from API:', data)
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error("Error fetching current user:", error)
    }
  }

  // Handle ESC key to close image viewer
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewingImage) {
        setViewingImage(null)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [viewingImage])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/posts?limit=20')
      
      if (response.ok) {
        const data = await response.json()
        // API returns { posts: [...], pagination: {...} }
        setPosts(Array.isArray(data.posts) ? data.posts : [])
      } else {
        setError("Không thể tải bài đăng")
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
      setError("Lỗi khi tải bài đăng")
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validation file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setError("Chỉ hỗ trợ định dạng ảnh: JPEG, PNG, GIF, WebP")
        return
      }

      // Validation file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setError("Kích thước tệp không được vượt quá 5MB")
        return
      }

      setSelectedImage(file)
      setError(null)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true)
      console.log("Uploading image to local storage:", file.name)
      
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Image uploaded successfully:", result.image_url)
        return result.image_url
      } else {
        const result = await response.json()
        console.error("Upload failed:", result)
        
        // Hiển thị lỗi cụ thể với toast
        if (response.status === 400) {
          toast({
            title: "Lỗi dữ liệu",
            description: result.error || "Dữ liệu ảnh không hợp lệ",
            variant: "destructive",
          })
        } else if (response.status === 401) {
          toast({
            title: "Lỗi xác thực",
            description: "Bạn cần đăng nhập để tải ảnh lên",
            variant: "destructive",
          })
        } else if (response.status === 413) {
          toast({
            title: "Lỗi kích thước",
            description: "Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Lỗi",
            description: result.error || "Không thể tải ảnh lên",
            variant: "destructive",
          })
        }
        return null
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "Lỗi kết nối",
          description: "Lỗi kết nối mạng khi tải ảnh",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Lỗi không xác định",
          description: "Lỗi không xác định khi tải ảnh lên",
          variant: "destructive",
        })
      }
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) {
      toast({
        title: "Lỗi",
        description: "Nội dung bài đăng không được để trống",
        variant: "destructive",
      })
      return
    }

    if (newPost.content.length > 2000) {
      toast({
        title: "Lỗi",
        description: "Nội dung bài đăng không được vượt quá 2000 ký tự",
        variant: "destructive",
      })
      return
    }

    setCreating(true)
    setError(null)

    try {
      console.log("Creating post with data:", newPost)
      
      let imageUrl: string | null = null

      // Step 1: Upload image to local storage if selected
      if (selectedImage) {
        console.log("Step 1: Uploading image to local storage...")
        // Loading state sẽ được hiển thị qua uploadingImage state
        
        imageUrl = await uploadImage(selectedImage)
        if (!imageUrl) {
          console.log("Image upload failed, aborting post creation")
          toast({
            title: "Lỗi",
            description: "Tải ảnh thất bại, vui lòng thử lại",
            variant: "destructive",
          })
          setCreating(false)
          return
        }
        
        toast({
          title: "Thành công",
          description: "Tải ảnh thành công!",
        })
        console.log("Step 1 completed: Image uploaded successfully, URL:", imageUrl)
      } else {
        console.log("Step 1 skipped: No image selected")
      }

      // Step 2: Create post with image URL
      const postData = {
        ...newPost,
        image_url: imageUrl // This will be null if no image, or a local storage URL if image uploaded
      }

      console.log("Step 2: Creating post with data:", postData)
      // Loading state sẽ được hiển thị qua creating state
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      })

      console.log("Step 2 response status:", response.status)

      if (response.ok) {
        const result = await response.json()
        console.log("Post created successfully:", result)
        
        toast({
          title: "Thành công",
          description: "Đăng bài thành công!",
        })
        
        // Reset form
        setCreateDialogOpen(false)
        setNewPost({
          content: '',
          post_type: 'general',
          is_anonymous: false
        })
        setSelectedImage(null)
        setImagePreview(null)
        
        // Refresh posts list
        fetchPosts()
      } else {
        const result = await response.json()
        console.error("Post creation failed:", result)
        
        // Hiển thị lỗi cụ thể hơn với toast
        if (response.status === 401) {
          toast({
            title: "Lỗi xác thực",
            description: "Bạn cần đăng nhập để tạo bài đăng",
            variant: "destructive",
          })
        } else if (response.status === 400) {
          toast({
            title: "Lỗi dữ liệu",
            description: result.error || "Dữ liệu không hợp lệ",
            variant: "destructive",
          })
        } else if (response.status === 500) {
          toast({
            title: "Lỗi server",
            description: "Lỗi server. Vui lòng thử lại sau",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Lỗi",
            description: result.error || "Không thể tạo bài đăng",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error creating post:", error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "Lỗi kết nối",
          description: "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Lỗi không xác định",
          description: "Lỗi không xác định khi tạo bài đăng",
          variant: "destructive",
        })
      }
    } finally {
      setCreating(false)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      // Optimistic update - update UI immediately
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          const wasLiked = post.user_liked
          return {
            ...post,
            user_liked: !wasLiked,
            likes_count: wasLiked ? post.likes_count - 1 : post.likes_count + 1
          }
        }
        return post
      }))

      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        // Update with actual data from server
        setPosts(prevPosts => prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              user_liked: data.liked
            }
          }
          return post
        }))
      } else {
        // Revert optimistic update on error
        setPosts(prevPosts => prevPosts.map(post => {
          if (post.id === postId) {
            const wasLiked = post.user_liked
            return {
              ...post,
              user_liked: !wasLiked,
              likes_count: wasLiked ? post.likes_count + 1 : post.likes_count - 1
            }
          }
          return post
        }))
        toast({
          title: "Lỗi",
          description: "Không thể thực hiện hành động này",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error liking post:", error)
      // Revert optimistic update on error
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          const wasLiked = post.user_liked
          return {
            ...post,
            user_liked: !wasLiked,
            likes_count: wasLiked ? post.likes_count + 1 : post.likes_count - 1
          }
        }
        return post
      }))
    }
  }

  const handleComment = async (postId: string) => {
    const content = commentText[postId]
    if (!content?.trim()) return

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          parent_comment_id: null
        })
      })

      if (response.ok) {
        setCommentText({ ...commentText, [postId]: '' })
        toast({
          title: "Thành công",
          description: "Đã thêm bình luận",
        })
        fetchPosts() // Refresh posts
      }
    } catch (error) {
      console.error("Error commenting:", error)
      toast({
        title: "Lỗi",
        description: "Không thể thêm bình luận",
        variant: "destructive",
      })
    }
  }

  const handleReplyComment = async (postId: string, commentId: string) => {
    const content = replyText[commentId]
    if (!content?.trim()) return

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          parent_comment_id: commentId
        })
      })

      if (response.ok) {
        setReplyText({ ...replyText, [commentId]: '' })
        setReplyingTo(null)
        toast({
          title: "Thành công",
          description: "Đã trả lời bình luận",
        })
        fetchPosts() // Refresh posts
      }
    } catch (error) {
      console.error("Error replying to comment:", error)
      toast({
        title: "Lỗi",
        description: "Không thể trả lời bình luận",
        variant: "destructive",
      })
    }
  }

  const handleLikeComment = async (postId: string, commentId: string) => {
    try {
      // Optimistic update
      setLikedComments(prev => ({
        ...prev,
        [commentId]: !prev[commentId]
      }))

      const response = await fetch(`/api/posts/${postId}/comments/${commentId}/like`, {
        method: 'POST'
      })

      if (!response.ok) {
        // Revert on error
        setLikedComments(prev => ({
          ...prev,
          [commentId]: !prev[commentId]
        }))
        toast({
          title: "Lỗi",
          description: "Không thể thực hiện hành động này",
          variant: "destructive",
        })
      } else {
        fetchPosts() // Refresh to get updated counts
      }
    } catch (error) {
      console.error("Error liking comment:", error)
      setLikedComments(prev => ({
        ...prev,
        [commentId]: !prev[commentId]
      }))
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài đăng này?")) return

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Đã xóa bài đăng",
        })
        fetchPosts() // Refresh posts
      } else {
        const data = await response.json()
        toast({
          title: "Lỗi",
          description: data.error || "Không thể xóa bài đăng",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "Lỗi",
        description: "Lỗi khi xóa bài đăng",
        variant: "destructive",
      })
    }
  }

  const handleEditPost = async (postId: string) => {
    if (!editPostContent.trim()) {
      toast({
        title: "Lỗi",
        description: "Nội dung không được để trống",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editPostContent,
        })
      })

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Đã cập nhật bài đăng",
        })
        setEditingPost(null)
        setEditPostContent('')
        fetchPosts()
      } else {
        const data = await response.json()
        toast({
          title: "Lỗi",
          description: data.error || "Không thể cập nhật bài đăng",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error editing post:", error)
      toast({
        title: "Lỗi",
        description: "Lỗi khi cập nhật bài đăng",
        variant: "destructive",
      })
    }
  }

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return

    try {
      const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Đã xóa bình luận",
        })
        fetchPosts()
      } else {
        const data = await response.json()
        toast({
          title: "Lỗi",
          description: data.error || "Không thể xóa bình luận",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast({
        title: "Lỗi",
        description: "Lỗi khi xóa bình luận",
        variant: "destructive",
      })
    }
  }

  const handleEditComment = async (postId: string, commentId: string) => {
    if (!editCommentContent.trim()) {
      toast({
        title: "Lỗi",
        description: "Nội dung không được để trống",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editCommentContent,
        })
      })

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Đã cập nhật bình luận",
        })
        setEditingComment(null)
        setEditCommentContent('')
        fetchPosts()
      } else {
        const data = await response.json()
        toast({
          title: "Lỗi",
          description: data.error || "Không thể cập nhật bình luận",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error editing comment:", error)
      toast({
        title: "Lỗi",
        description: "Lỗi khi cập nhật bình luận",
        variant: "destructive",
      })
    }
  }

  const canModifyPost = (post: PostDetail) => {
    if (!currentUser) {
      console.log('[DEBUG] canModifyPost: No current user')
      return false
    }
    const canModify = currentUser.role === 'admin' || post.user?.id === currentUser.id
    console.log('[DEBUG] canModifyPost:', {
      userRole: currentUser.role,
      userId: currentUser.id,
      postUserId: post.user?.id,
      canModify
    })
    return canModify
  }

  const canModifyComment = (comment: any) => {
    if (!currentUser) {
      console.log('[DEBUG] canModifyComment: No current user')
      return false
    }
    const canModify = currentUser.role === 'admin' || comment.user?.id === currentUser.id
    console.log('[DEBUG] canModifyComment:', {
      userRole: currentUser.role,
      userId: currentUser.id,
      commentUserId: comment.user?.id,
      canModify
    })
    return canModify
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cộng đồng</h1>
          <p className="text-muted-foreground">Kết nối và chia sẻ với cộng đồng StayEase</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header with Logo */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="w-full max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
          <a 
            href="/dashboard" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              StayEase
            </span>
          </a>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">Cộng đồng</span>
          </div>
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-x-8 px-4 py-6">
      
      {/* === CỘT 1: SIDEBAR TRÁI (DANH MỤC) === */}
      <aside className="hidden lg:block lg:col-span-1">
        <div className="sticky top-20">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh mục</h3>
            
            {/* Filter Tabs */}
            <div className="space-y-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedFilter === 'all'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              {[
                { value: 'general', label: 'Chia sẻ', icon: '💬' },
                { value: 'announcement', label: 'Thông báo', icon: '📢' },
                { value: 'event', label: 'Sự kiện', icon: '🎉' },
                { value: 'complaint', label: 'Khiếu nại', icon: '⚠️' },
                { value: 'suggestion', label: 'Góp ý', icon: '💡' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value as PostType)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedFilter === filter.value
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{filter.icon}</span>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* === CỘT 2: KHỐI BÀI VIẾT Ở GIỮA === */}
      <main className="col-span-1 lg:col-span-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cộng đồng</h1>
            <p className="text-muted-foreground">Kết nối và chia sẻ với cộng đồng StayEase</p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Đăng bài
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tạo bài đăng mới</DialogTitle>
              <DialogDescription>
                Chia sẻ suy nghĩ và kết nối với cộng đồng
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Label>Loại bài đăng</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'general', label: 'Chia sẻ', icon: '💬', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                    { value: 'announcement', label: 'Thông báo', icon: '📢', color: 'bg-red-100 text-red-800 border-red-200' },
                    { value: 'event', label: 'Sự kiện', icon: '🎉', color: 'bg-green-100 text-green-800 border-green-200' },
                    { value: 'complaint', label: 'Khiếu nại', icon: '⚠️', color: 'bg-orange-100 text-orange-800 border-orange-200' },
                    { value: 'suggestion', label: 'Góp ý', icon: '💡', color: 'bg-purple-100 text-purple-800 border-purple-200' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setNewPost({...newPost, post_type: type.value as PostType})}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                        newPost.post_type === type.value
                          ? `${type.color} border-current shadow-md`
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{type.icon}</span>
                        <span className="font-medium text-sm">{type.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Nội dung</Label>
                <Textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  placeholder="Chia sẻ suy nghĩ của bạn..."
                  rows={6}
                />
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{newPost.content.length}/2000 ký tự</span>
                  <span className={newPost.content.length > 2000 ? 'text-red-500' : ''}>
                    {newPost.content.length > 2000 ? 'Vượt quá giới hạn' : ''}
                  </span>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Hình ảnh đính kèm</Label>
                <div className="space-y-3">
                  {/* Upload Button */}
                  <div className="flex items-center gap-2">
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <Label 
                      htmlFor="image-upload" 
                      className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Chọn ảnh</span>
                    </Label>
                    {selectedImage && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Xóa
                      </Button>
                    )}
                  </div>

                       {/* Image Preview */}
                       {imagePreview && (
                         <div className="relative">
                           <Image
                             src={imagePreview}
                             alt="Preview"
                             width={400}
                             height={192}
                             className="w-full h-48 object-cover rounded-lg border"
                           />
                           <div className="absolute top-2 right-2">
                             <Button
                               type="button"
                               variant="destructive"
                               size="sm"
                               onClick={handleRemoveImage}
                               className="h-8 w-8 p-0"
                             >
                               <X className="h-4 w-4" />
                             </Button>
                           </div>
                         </div>
                       )}

                  {/* Upload Progress */}
                  {uploadingImage && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Đang tải ảnh lên...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleCreatePost}
                  disabled={creating || !newPost.content.trim()}
                  className="flex-1"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang đăng...
                    </>
                  ) : (
                    'Đăng bài'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>

        {/* Mobile Filter Tabs */}
        <div className="lg:hidden mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedFilter === 'all'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            {[
              { value: 'general', label: 'Chia sẻ', icon: '💬' },
              { value: 'announcement', label: 'Thông báo', icon: '📢' },
              { value: 'event', label: 'Sự kiện', icon: '🎉' },
              { value: 'complaint', label: 'Khiếu nại', icon: '⚠️' },
              { value: 'suggestion', label: 'Góp ý', icon: '💡' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedFilter(filter.value as PostType)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedFilter === filter.value
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{filter.icon}</span>
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {(() => {
          // Ensure posts is an array
          const postsArray = Array.isArray(posts) ? posts : []
          
          const filteredPosts = selectedFilter === 'all' 
            ? postsArray 
            : postsArray.filter(post => post.post_type === selectedFilter)
          
          if (filteredPosts.length === 0) {
            return (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {selectedFilter === 'all' ? 'Chưa có bài đăng nào' : `Chưa có bài đăng loại ${getPostTypeDisplayName(selectedFilter as PostType)}`}
                  </h3>
                  <p className="text-muted-foreground text-center">
                    {selectedFilter === 'all' 
                      ? 'Hãy là người đầu tiên chia sẻ với cộng đồng!'
                      : `Hãy tạo bài đăng đầu tiên về ${getPostTypeDisplayName(selectedFilter as PostType).toLowerCase()}!`
                    }
                  </p>
                </CardContent>
              </Card>
            )
          }

          return filteredPosts.map((post) => (
            <Card key={post.id} className={`transition-all duration-200 hover:shadow-lg ${
              post.is_pinned ? "border-yellow-200 bg-yellow-50 shadow-md" : "hover:border-gray-300"
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
                      <AvatarImage src={post.user?.avatar_url || ""} alt={post.user?.full_name || "User"} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                        {post.user ? getInitials(post.user.full_name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">
                          {post.is_anonymous ? "Ẩn danh" : (post.user?.full_name || "Người dùng")}
                        </p>
                        {post.is_pinned && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            <Pin className="h-3 w-3" />
                            <span>Ghim</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500">
                          {formatTimeAgo(post.created_at)}
                        </p>
                        <Badge className={`${getPostTypeColor(post.post_type)} font-medium`}>
                          {getPostTypeIcon(post.post_type)} {getPostTypeDisplayName(post.post_type)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {canModifyPost(post) && (
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-400 hover:text-blue-600"
                        onClick={() => {
                          setEditingPost(post.id)
                          setEditPostContent(post.content)
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-400 hover:text-red-600"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {editingPost === post.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editPostContent}
                      onChange={(e) => setEditPostContent(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingPost(null)
                          setEditPostContent('')
                        }}
                      >
                        Hủy
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEditPost(post.id)}
                        disabled={!editPostContent.trim()}
                      >
                        Lưu
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                </div>
                  </>
                )}
                
                {post.image_url && (
                  <div 
                    className="rounded-xl overflow-hidden shadow-sm border bg-gray-50 cursor-pointer group"
                    onClick={() => setViewingImage(post.image_url!)}
                  >
                    <Image 
                      src={post.image_url} 
                      alt="Post image" 
                      width={800}
                      height={500}
                      className="w-full h-auto max-h-[500px] object-contain group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 transition-all duration-200 ${
                      post.user_liked 
                        ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
                        : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <Heart className={`h-4 w-4 transition-all duration-200 ${
                      post.user_liked ? 'fill-red-500 scale-110' : 'hover:scale-110'
                    }`} />
                    <span className="font-medium">{post.likes_count}</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                    className={`flex items-center gap-2 transition-all duration-200 ${
                      replyingTo === post.id 
                        ? 'text-blue-500 hover:text-blue-600 hover:bg-blue-50' 
                        : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    <MessageSquare className={`h-4 w-4 transition-all duration-200 ${
                      replyingTo === post.id ? 'scale-110' : 'hover:scale-110'
                    }`} />
                    <span className="font-medium">{post.comments_count}</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center gap-2 text-gray-500 hover:text-green-500 hover:bg-green-50 transition-all duration-200"
                  >
                    <Share2 className="h-4 w-4 hover:scale-110 transition-all duration-200" />
                    <span className="font-medium">Chia sẻ</span>
                  </Button>
                </div>

                {/* Comments Section */}
                {replyingTo === post.id && (
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8 ring-1 ring-gray-200">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold">
                          {getInitials("You")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          placeholder="Viết bình luận..."
                          value={commentText[post.id] || ''}
                          onChange={(e) => setCommentText({...commentText, [post.id]: e.target.value})}
                          rows={2}
                          className="resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <div className="flex justify-end">
                          <Button 
                            onClick={() => handleComment(post.id)}
                            disabled={!commentText[post.id]?.trim()}
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Gửi
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comments List */}
                {post.comments.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      {post.comments_count} bình luận
                    </h4>
                    {(() => {
                      // Separate parent comments from replies
                      const parentComments = post.comments.filter((c: any) => !c.parent_comment_id)
                      const replyMap = post.comments
                        .filter((c: any) => c.parent_comment_id)
                        .reduce((acc: any, reply: any) => {
                          const parentId = reply.parent_comment_id
                          if (!acc[parentId]) acc[parentId] = []
                          acc[parentId].push(reply)
                          return acc
                        }, {})
                      
                      const visibleComments = showAllComments[post.id] 
                        ? parentComments 
                        : parentComments.slice(0, 3)
                      
                      return (
                        <>
                          {visibleComments.map((comment) => {
                            const replies = replyMap[comment.id] || []
                            return (
                            <div key={comment.id} className="space-y-3">
                              {/* Main Comment */}
                              <div className="flex gap-3 group">
                                <Avatar className="h-8 w-8 ring-1 ring-gray-200">
                                  <AvatarImage src={comment.user.avatar_url || ""} alt={comment.user.full_name} />
                                  <AvatarFallback className="bg-gradient-to-r from-gray-400 to-gray-600 text-white text-xs font-semibold">
                                    {getInitials(comment.user.full_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-gray-900">{comment.user.full_name}</p>
                                    <p className="text-xs text-gray-500">
                                      {formatTimeAgo(comment.created_at)}
                                    </p>
                                  </div>
                                  
                                  {editingComment === comment.id ? (
                                    <div className="space-y-2">
                                      <Textarea
                                        value={editCommentContent}
                                        onChange={(e) => setEditCommentContent(e.target.value)}
                                        rows={2}
                                        className="text-sm"
                                      />
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setEditingComment(null)
                                            setEditCommentContent('')
                                          }}
                                        >
                                          Hủy
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => handleEditComment(post.id, comment.id)}
                                          disabled={!editCommentContent.trim()}
                                        >
                                          Lưu
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                                  )}
                                  
                                  <div className="flex items-center gap-3">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => handleLikeComment(post.id, comment.id)}
                                      className={`h-6 px-2 transition-all duration-200 ${
                                        likedComments[comment.id] || comment.user_liked
                                          ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
                                          : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                                      }`}
                                    >
                                      <Heart className={`h-3 w-3 mr-1 transition-all ${
                                        likedComments[comment.id] || comment.user_liked ? 'fill-red-500' : ''
                                      }`} />
                                      <span className="text-xs">{comment.likes_count || 0}</span>
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 px-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50"
                                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                    >
                                      <Reply className="h-3 w-3 mr-1" />
                                      <span className="text-xs">Trả lời</span>
                                    </Button>
                                    
                                    {canModifyComment(comment) && (
                                      <>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-6 px-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50"
                                          onClick={() => {
                                            setEditingComment(comment.id)
                                            setEditCommentContent(comment.content)
                                          }}
                                        >
                                          <Edit2 className="h-3 w-3 mr-1" />
                                          <span className="text-xs">Sửa</span>
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-6 px-2 text-gray-500 hover:text-red-500 hover:bg-red-50"
                                          onClick={() => handleDeleteComment(post.id, comment.id)}
                                        >
                                          <Trash2 className="h-3 w-3 mr-1" />
                                          <span className="text-xs">Xóa</span>
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                  
                                  {/* Reply Input */}
                                  {replyingTo === comment.id && (
                                    <div className="flex gap-2 mt-3 ml-4 pl-4 border-l-2 border-blue-200">
                                      <Avatar className="h-7 w-7 ring-1 ring-gray-200">
                                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold">
                                          You
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 space-y-2">
                                        <Textarea
                                          placeholder={`Trả lời ${comment.user.full_name}...`}
                                          value={replyText[comment.id] || ''}
                                          onChange={(e) => setReplyText({...replyText, [comment.id]: e.target.value})}
                                          rows={2}
                                          className="resize-none text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        <div className="flex justify-end gap-2">
                                          <Button 
                                            variant="ghost"
                                            onClick={() => {
                                              setReplyingTo(null)
                                              setReplyText({...replyText, [comment.id]: ''})
                                            }}
                                            size="sm"
                                            className="text-xs"
                                          >
                                            Hủy
                                          </Button>
                                          <Button 
                                            onClick={() => handleReplyComment(post.id, comment.id)}
                                            disabled={!replyText[comment.id]?.trim()}
                                            size="sm"
                                            className="bg-blue-500 hover:bg-blue-600 text-white text-xs"
                                          >
                                            <Send className="h-3 w-3 mr-1" />
                                            Gửi
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Replies to this comment */}
                                  {replies.length > 0 && (
                                    <div className="ml-4 pl-4 border-l-2 border-gray-200 space-y-3 mt-3">
                                      {replies.map((reply: any) => (
                                        <div key={reply.id} className="flex gap-2 group">
                                          <Avatar className="h-7 w-7 ring-1 ring-gray-200">
                                            <AvatarImage src={reply.user.avatar_url || ""} alt={reply.user.full_name} />
                                            <AvatarFallback className="bg-gradient-to-r from-gray-300 to-gray-500 text-white text-xs">
                                              {getInitials(reply.user.full_name)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                              <p className="text-xs font-semibold text-gray-900">{reply.user.full_name}</p>
                                              <p className="text-xs text-gray-500">
                                                {formatTimeAgo(reply.created_at)}
                                              </p>
                                            </div>
                                            
                                            {editingComment === reply.id ? (
                                              <div className="space-y-2">
                                                <Textarea
                                                  value={editCommentContent}
                                                  onChange={(e) => setEditCommentContent(e.target.value)}
                                                  rows={2}
                                                  className="text-xs"
                                                />
                                                <div className="flex justify-end gap-1">
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 text-xs"
                                                    onClick={() => {
                                                      setEditingComment(null)
                                                      setEditCommentContent('')
                                                    }}
                                                  >
                                                    Hủy
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    className="h-6 text-xs"
                                                    onClick={() => handleEditComment(post.id, reply.id)}
                                                    disabled={!editCommentContent.trim()}
                                                  >
                                                    Lưu
                                                  </Button>
                                                </div>
                                              </div>
                                            ) : (
                                              <p className="text-xs text-gray-700 leading-relaxed">{reply.content}</p>
                                            )}
                                            
                                            <div className="flex items-center gap-2">
                                              <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => handleLikeComment(post.id, reply.id)}
                                                className={`h-5 px-2 transition-all duration-200 ${
                                                  likedComments[reply.id] || reply.user_liked
                                                    ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
                                                    : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                                                }`}
                                              >
                                                <Heart className={`h-2.5 w-2.5 mr-0.5 ${
                                                  likedComments[reply.id] || reply.user_liked ? 'fill-red-500' : ''
                                                }`} />
                                                <span className="text-xs">{reply.likes_count || 0}</span>
                                              </Button>
                                              
                                              {canModifyComment(reply) && (
                                                <>
                                                  <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-5 px-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50"
                                                    onClick={() => {
                                                      setEditingComment(reply.id)
                                                      setEditCommentContent(reply.content)
                                                    }}
                                                  >
                                                    <Edit2 className="h-2.5 w-2.5" />
                                                  </Button>
                                                  <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-5 px-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50"
                                                    onClick={() => handleDeleteComment(post.id, reply.id)}
                                                  >
                                                    <Trash2 className="h-2.5 w-2.5" />
                                                  </Button>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )})}
                          
                          {/* Show More/Less Button */}
                          {parentComments.length > 3 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowAllComments({
                                ...showAllComments,
                                [post.id]: !showAllComments[post.id]
                              })}
                              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 w-full"
                            >
                              {showAllComments[post.id] 
                                ? `Ẩn bớt` 
                                : `Xem thêm ${parentComments.length - 3} bình luận`
                              }
                            </Button>
                          )}
                        </>
                      )
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        })()}
        </div>
      </main>

      {/* === CỘT 3: SIDEBAR PHẢI (HIỆN ĐỂ TRỐNG) === */}
      <aside className="hidden lg:block lg:col-span-1">
        <div className="sticky top-20">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Mẹo sử dụng</h4>
              <p className="text-sm text-blue-800">
                Sử dụng các danh mục bên trái để lọc bài đăng theo chủ đề. 
                Nhấn "Đăng bài" để chia sẻ với cộng đồng!
              </p>
            </div>
          </div>
        </div>
      </aside>

    </div>

    {/* Image Viewer Modal */}
    {viewingImage && (
      <div 
        className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
        onClick={() => setViewingImage(null)}
      >
        <button
          onClick={() => setViewingImage(null)}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>
        <div 
          className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={viewingImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
          Nhấn ESC hoặc click bên ngoài để đóng
        </div>
      </div>
    )}
    </>
  )
}