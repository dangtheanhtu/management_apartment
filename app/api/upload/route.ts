import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import cloudinary from "@/lib/cloudinary";

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

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Determine folder based on type
    let folder = "stayease/general";
    if (type === "service-request") {
      folder = "stayease/service-requests";
    } else if (type === "post") {
      folder = "stayease/posts";
    } else if (type === "amenity") {
      folder = "stayease/amenities";
    } else if (type === "apartment") {
      folder = "stayease/apartments";
    } else if (type === "avatar") {
      folder = "stayease/avatars";
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder: folder,
      resource_type: "auto",
      transformation: [
        { width: 1200, height: 1200, crop: "limit" }, // Giới hạn kích thước
        { quality: "auto" }, // Tự động tối ưu chất lượng
        { fetch_format: "auto" }, // Tự động chọn format tốt nhất
      ],
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      image_url: result.secure_url,
      public_id: result.public_id,
      file_name: result.original_filename,
      file_size: result.bytes,
      file_type: result.format,
    });

  } catch (error) {
    console.error("Error uploading file:", error);
    
    return NextResponse.json(
      { error: "Lỗi server khi tải ảnh lên" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove images from Cloudinary
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Người dùng chưa đăng nhập" },
        { status: 401 }
      );
    }

    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { error: "Không có public ID" },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({
      success: true,
      message: "Đã xóa ảnh thành công"
    });

  } catch (error) {
    console.error("Error deleting file:", error);
    
    return NextResponse.json(
      { error: "Lỗi server khi xóa ảnh" },
      { status: 500 }
    );
  }
}
