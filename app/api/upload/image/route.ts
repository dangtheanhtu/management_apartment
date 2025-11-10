import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/server"
import cloudinary from "@/lib/cloudinary"

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

    console.log("File validation passed, uploading to Cloudinary")

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder: "stayease/posts",
      resource_type: "auto",
      transformation: [
        { width: 1200, height: 1200, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    })

    console.log("Image uploaded successfully to Cloudinary, URL:", result.secure_url)

    return NextResponse.json({
      success: true,
      image_url: result.secure_url,
      imageUrl: result.secure_url,
      public_id: result.public_id,
      file_name: result.original_filename,
      file_path: result.secure_url,
      file_size: result.bytes,
      file_type: result.format
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
