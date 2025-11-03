"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Clock, XCircle, AlertCircle, Home, User, Phone, Calendar, Image as ImageIcon, X, MessageSquare, Send } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ServiceRequest {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  images: string[];
  createdAt: string;
  apartmentId?: {
    apartmentNumber: string;
    building: string;
    floor: number;
  };
  userId?: {
    fullName: string;
    email: string;
    phone: string;
  };
  assignedTo?: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  } | null;
  messages?: Array<{
    _id: string;
    sender: {
      _id: string;
      fullName: string;
      role: string;
    };
    content: string;
    createdAt: string;
  }>;
}

const STATUS_CONFIG = {
  pending: { label: "Chờ xử lý", icon: Clock, color: "bg-yellow-500" },
  in_progress: { label: "Đang xử lý", icon: Clock, color: "bg-blue-500" },
  resolved: { label: "Đã giải quyết", icon: CheckCircle, color: "bg-green-500" },
  cancelled: { label: "Đã hủy", icon: XCircle, color: "bg-gray-500" },
};

const CATEGORY_OPTIONS = [
  { value: "plumbing", label: "Sửa ống nước" },
  { value: "electrical", label: "Điện" },
  { value: "hvac", label: "Điều hòa" },
  { value: "appliance", label: "Thiết bị" },
  { value: "structural", label: "Kết cấu" },
  { value: "other", label: "Khác" },
];

export default function StaffMaintenancePage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState<string | null>(null);
  const [messageText, setMessageText] = useState<Record<string, string>>({});
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filterStatus, filterCategory]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedImage) {
        setSelectedImage(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedImage]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let url = "/api/service-requests";
      const params = new URLSearchParams();
      
      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }
      if (filterCategory !== "all") {
        params.append("category", filterCategory);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log("Service requests data:", data.data);
        setRequests(data.data || []);
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách yêu cầu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setUpdatingStatus(requestId);
      const response = await fetch(`/api/service-requests/${requestId}/accept`, {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Đã nhận yêu cầu bảo trì",
        });
        fetchRequests();
      } else {
        const error = await response.json();
        toast({
          title: "Lỗi",
          description: error.message || "Không thể nhận yêu cầu",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể nhận yêu cầu",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const updateStatus = async (requestId: string, newStatus: string) => {
    try {
      setUpdatingStatus(requestId);
      const response = await fetch(`/api/service-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Đã cập nhật trạng thái yêu cầu",
        });
        fetchRequests();
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const sendMessage = async (requestId: string) => {
    const content = messageText[requestId];
    if (!content?.trim()) return;

    try {
      setSendingMessage(true);
      const response = await fetch(`/api/service-requests/${requestId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        setMessageText({ ...messageText, [requestId]: "" });
        toast({
          title: "Thành công",
          description: "Đã gửi tin nhắn",
        });
        fetchRequests();
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể gửi tin nhắn",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Yêu cầu bảo trì</h1>
        <p className="text-muted-foreground">Nhận và xử lý các yêu cầu bảo trì từ cư dân</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Trạng thái</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="in_progress">Đang xử lý</SelectItem>
                <SelectItem value="resolved">Đã giải quyết</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Danh mục</label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Service Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">
                Không có yêu cầu bảo trì nào
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {requests.map((request) => {
              const StatusIcon = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]?.icon || AlertCircle;
              const statusConfig = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
              
              console.log("Request:", request._id, "Status:", request.status, "AssignedTo:", request.assignedTo);

              return (
                <Card key={request._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {request.title}
                          <Badge className={cn(statusConfig.color, "text-white")}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {CATEGORY_OPTIONS.find((c) => c.value === request.category)?.label || request.category}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {console.log("Checking button condition:", {
                          status: request.status,
                          isPending: request.status === "pending",
                          assignedTo: request.assignedTo,
                          hasAssignedTo: !!request.assignedTo,
                          shouldShowButton: request.status === "pending" && !request.assignedTo
                        })}
                        {request.status === "pending" && !request.assignedTo && (
                          <Button
                            onClick={() => handleAcceptRequest(request._id)}
                            disabled={updatingStatus === request._id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {updatingStatus === request._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Nhận yêu cầu"
                            )}
                          </Button>
                        )}
                        {request.assignedTo && (
                          <Select
                            value={request.status}
                            onValueChange={(value) => updateStatus(request._id, value)}
                            disabled={updatingStatus === request._id}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="in_progress">Đang xử lý</SelectItem>
                              <SelectItem value="resolved">Đã giải quyết</SelectItem>
                              <SelectItem value="cancelled">Đã hủy</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{request.description}</p>

                    {/* Apartment, User and Staff Info */}
                    <div className="grid grid-cols-3 gap-4 p-3 bg-muted rounded-lg">
                      {request.apartmentId && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Home className="h-3 w-3" />
                            Căn hộ
                          </p>
                          <p className="text-sm font-medium">
                            {request.apartmentId.apartmentNumber} - Tòa {request.apartmentId.building} - Tầng {request.apartmentId.floor}
                          </p>
                        </div>
                      )}
                      {request.userId && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Người gửi
                          </p>
                          <p className="text-sm font-medium">{request.userId.fullName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {request.userId.phone}
                          </p>
                        </div>
                      )}
                      {request.assignedTo && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Nhân viên xử lý
                          </p>
                          <p className="text-sm font-medium text-green-600">{request.assignedTo.fullName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {request.assignedTo.phone}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Images */}
                    {request.images && request.images.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2 flex items-center gap-1">
                          <ImageIcon className="h-4 w-4" />
                          Ảnh đính kèm ({request.images.length})
                        </p>
                        <div className="grid grid-cols-5 gap-2">
                          {request.images.map((imageUrl, index) => (
                            <div key={index} className="relative aspect-square group">
                              <Image
                                src={imageUrl}
                                alt={`${request.title} - Ảnh ${index + 1}`}
                                fill
                                className="object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                                onClick={() => setSelectedImage(imageUrl)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Chat Section */}
                    {request.assignedTo && (
                      <div className="border-t pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setChatOpen(chatOpen === request._id ? null : request._id)}
                          className="w-full"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {chatOpen === request._id ? "Ẩn tin nhắn" : `Tin nhắn (${request.messages?.length || 0})`}
                        </Button>

                        {chatOpen === request._id && (
                          <div className="mt-4 space-y-4">
                            {/* Messages */}
                            <div className="max-h-64 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-lg">
                              {request.messages && request.messages.length > 0 ? (
                                request.messages.map((message) => (
                                  <div
                                    key={message._id}
                                    className={cn(
                                      "flex",
                                      message.sender.role === "staff" ? "justify-end" : "justify-start"
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "max-w-[70%] rounded-lg p-3",
                                        message.sender.role === "staff"
                                          ? "bg-blue-500 text-white"
                                          : "bg-white border"
                                      )}
                                    >
                                      <p className="text-xs font-semibold mb-1">
                                        {message.sender.fullName}
                                      </p>
                                      <p className="text-sm">{message.content}</p>
                                      <p className="text-xs opacity-70 mt-1">
                                        {formatTime(message.createdAt)}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-center text-sm text-muted-foreground">
                                  Chưa có tin nhắn nào
                                </p>
                              )}
                            </div>

                            {/* Send Message */}
                            <div className="flex gap-2">
                              <Textarea
                                placeholder="Nhập tin nhắn..."
                                value={messageText[request._id] || ""}
                                onChange={(e) =>
                                  setMessageText({ ...messageText, [request._id]: e.target.value })
                                }
                                rows={2}
                                className="resize-none"
                              />
                              <Button
                                onClick={() => sendMessage(request._id)}
                                disabled={!messageText[request._id]?.trim() || sendingMessage}
                                className="px-4"
                              >
                                {sendingMessage ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(request.createdAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
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
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
            Nhấn ESC hoặc click bên ngoài để đóng
          </div>
        </div>
      )}
    </div>
  );
}
