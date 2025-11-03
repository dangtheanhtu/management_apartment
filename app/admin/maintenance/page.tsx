"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Clock, XCircle, AlertCircle, Home, User, Phone, Calendar, Image as ImageIcon, X } from "lucide-react";
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

export default function MaintenancePage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
        <h1 className="text-3xl font-bold tracking-tight">Quản lý yêu cầu bảo trì</h1>
        <p className="text-muted-foreground">Xem và xử lý các yêu cầu bảo trì từ cư dân</p>
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
                        <Select
                          value={request.status}
                          onValueChange={(value) => updateStatus(request._id, value)}
                          disabled={updatingStatus === request._id}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Chờ xử lý</SelectItem>
                            <SelectItem value="in_progress">Đang xử lý</SelectItem>
                            <SelectItem value="resolved">Đã giải quyết</SelectItem>
                            <SelectItem value="cancelled">Đã hủy</SelectItem>
                          </SelectContent>
                        </Select>
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
