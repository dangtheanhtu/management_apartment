import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import dbConnect from "@/lib/mongodb/connection";
import { ServiceRequest } from "@/lib/mongodb/models/ServiceRequest";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "staff") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const serviceRequest = await ServiceRequest.findById(params.id);

    if (!serviceRequest) {
      return NextResponse.json(
        { message: "Service request not found" },
        { status: 404 }
      );
    }

    if (serviceRequest.assignedTo) {
      return NextResponse.json(
        { message: "Request already assigned" },
        { status: 400 }
      );
    }

    serviceRequest.assignedTo = session.user.id;
    serviceRequest.status = "in_progress";
    await serviceRequest.save();

    const updatedRequest = await ServiceRequest.findById(params.id)
      .populate("userId", "fullName email phone")
      .populate("apartmentId", "apartmentNumber building floor")
      .populate("assignedTo", "fullName email phone");

    return NextResponse.json({
      message: "Request accepted successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error accepting request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
