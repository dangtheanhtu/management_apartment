import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Người dùng chưa đăng nhập" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string || "general";

    if (!file) {
      return NextResponse.json(
        { error: "Không có tệp được tải lên" },
        { status: 400 }
      );
    }

    // Validation file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Chỉ hỗ trợ định dạng ảnh: JPEG, PNG, GIF, WebP" },
        { status: 400 }
      );
    }

    // Validation file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Kích thước tệp không được vượt quá 5MB" },
        { status: 400 }
      );
    }

    // Generate unique file path based on type
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop();
    const fileName = `${type}_${user.id}_${timestamp}_${randomString}.${fileExtension}`;
    
    // Determine upload directory based on type
    let subDir = "general";
    if (type === "service-request") {
      subDir = "service-requests";
    } else if (type === "post") {
      subDir = "posts";
    } else if (type === "amenity") {
      subDir = "amenities";
    } else if (type === "apartment") {
      subDir = "apartments";
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", subDir);
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const filePath = join(uploadsDir, fileName);

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write file to disk
    await writeFile(filePath, buffer);

    // Generate public URL
    const imageUrl = `/uploads/${subDir}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: imageUrl,
      image_url: imageUrl,
      file_name: fileName,
      file_size: file.size,
      file_type: file.type,
    });

  } catch (error) {
    console.error("Error uploading file:", error);
    
    return NextResponse.json(
      { error: "Lỗi server khi tải ảnh lên" },
      { status: 500 }
    );
  }
}
