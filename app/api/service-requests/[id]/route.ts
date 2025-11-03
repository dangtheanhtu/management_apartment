import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { connectDB } from "@/lib/mongodb/connection";
import { ServiceRequest } from "@/lib/mongodb/models";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Người dùng chưa đăng nhập" },
        { status: 401 }
      );
    }

    // Only admin and staff can update service requests
    if (user.role !== "admin" && user.role !== "staff") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Thiếu trạng thái" },
        { status: 400 }
      );
    }

    const validStatuses = ["pending", "in_progress", "resolved", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Trạng thái không hợp lệ" },
        { status: 400 }
      );
    }

    await connectDB();

    const serviceRequest = await ServiceRequest.findById(params.id);

    if (!serviceRequest) {
      return NextResponse.json(
        { error: "Không tìm thấy yêu cầu" },
        { status: 404 }
      );
    }

    serviceRequest.status = status;
    if (status === "in_progress" && !serviceRequest.assignedTo) {
      serviceRequest.assignedTo = user.id;
    }

    await serviceRequest.save();

    await serviceRequest.populate("userId", "fullName email phone");
    await serviceRequest.populate("apartmentId", "apartmentNumber building floor");
    await serviceRequest.populate("assignedTo", "fullName email");

    return NextResponse.json(serviceRequest);
  } catch (error) {
    console.error("Error updating service request:", error);
    return NextResponse.json(
      { error: "Lỗi server khi cập nhật yêu cầu" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Người dùng chưa đăng nhập" },
        { status: 401 }
      );
    }

    // Only admin can delete service requests
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      );
    }

    await connectDB();

    const serviceRequest = await ServiceRequest.findByIdAndDelete(params.id);

    if (!serviceRequest) {
      return NextResponse.json(
        { error: "Không tìm thấy yêu cầu" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Đã xóa yêu cầu thành công" });
  } catch (error) {
    console.error("Error deleting service request:", error);
    return NextResponse.json(
      { error: "Lỗi server khi xóa yêu cầu" },
      { status: 500 }
    );
  }
}
