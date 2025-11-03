import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/upload/image - Starting request")
    
    const user = await getCurrentUser()
    console.log("Current user:", user ? `${user.email} (${user.role})` : "Not authenticated")
    
    if (!user) {
      console.log("No user found, returning 401")
      return NextResponse.json(
        { error: "Người dùng chưa đăng nhập" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      console.log("No file provided")
      return NextResponse.json(
        { error: "Không có tệp được tải lên" },
        { status: 400 }
      )
    }

    // Validation file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      console.log("Invalid file type:", file.type)
      return NextResponse.json(
        { error: "Chỉ hỗ trợ định dạng ảnh: JPEG, PNG, GIF, WebP" },
        { status: 400 }
      )
    }

    // Validation file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      console.log("File too large:", file.size)
      return NextResponse.json(
        { error: "Kích thước tệp không được vượt quá 5MB" },
        { status: 400 }
      )
    }

    console.log("File validation passed, uploading to local storage")

    // Generate unique file path
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `post_${user.id}_${timestamp}_${randomString}.${fileExtension}`
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'posts')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const filePath = join(uploadsDir, fileName)

    console.log("Uploading file to path:", filePath)

    // Convert file to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Write file to disk
    await writeFile(filePath, buffer)

    console.log("File uploaded successfully")

    // Generate public URL
    const imageUrl = `/uploads/posts/${fileName}`

    console.log("Image uploaded successfully, URL:", imageUrl)

    return NextResponse.json({
      success: true,
      image_url: imageUrl,
      file_name: fileName,
      file_path: `/uploads/posts/${fileName}`,
      file_size: file.size,
      file_type: file.type
    })

  } catch (error) {
    console.error("Error in POST /api/upload/image:", error)
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Lỗi server khi tải ảnh lên" },
      { status: 500 }
    )
  }
}
