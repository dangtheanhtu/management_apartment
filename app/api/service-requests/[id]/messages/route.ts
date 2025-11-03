import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import dbConnect from "@/lib/mongodb/connection";
import { ServiceRequest } from "@/lib/mongodb/models/ServiceRequest";
import { Message } from "@/lib/mongodb/models/Message";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
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

    // Check if user has access to this chat
    const canAccess =
      session.user.role === "admin" ||
      serviceRequest.userId.toString() === session.user.id ||
      serviceRequest.assignedTo?.toString() === session.user.id;

    if (!canAccess) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const messages = await Message.find({ serviceRequestId: params.id })
      .populate("sender", "fullName email role")
      .sort({ createdAt: 1 });

    return NextResponse.json({ data: messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
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

    // Check if user can send messages in this chat
    const canSend =
      session.user.role === "admin" ||
      serviceRequest.userId.toString() === session.user.id ||
      serviceRequest.assignedTo?.toString() === session.user.id;

    if (!canSend) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { message: "Content is required" },
        { status: 400 }
      );
    }

    const message = await Message.create({
      serviceRequestId: params.id,
      sender: session.user.id,
      content: content.trim(),
    });

    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "fullName email role"
    );

    return NextResponse.json({
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
