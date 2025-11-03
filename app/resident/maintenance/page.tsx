"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, AlertCircle, CheckCircle, Clock, XCircle, FileText, User, Phone, Home, Image as ImageIcon, X, MessageSquare, Send } from "lucide-react";
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

interface UserApartment {
  apartmentNumber: string;
  building: string;
  floor: number;
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
  const { data: session } = useSession();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [userApartment, setUserApartment] = useState<UserApartment | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState<string | null>(null);
  const [messageText, setMessageText] = useState<Record<string, string>>({});
  const [sendingMessage, setSendingMessage] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });

  useEffect(() => {
    fetchRequests();
    fetchUserInfo();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedImage) {
        setSelectedImage(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedImage]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("/api/me");
      if (response.ok) {
        const data = await response.json();
        if (data.apartmentId) {
          setUserApartment({
            apartmentNumber: data.apartmentId.apartmentNumber,
            building: data.apartmentId.building,
            floor: data.apartmentId.floor,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/service-requests");
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > 5) {
      toast({
        title: "Giới hạn ảnh",
        description: "Chỉ có thể tải lên tối đa 5 ảnh",
        variant: "destructive",
      });
      return;
    }

    setUploadingImages(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "service-request");

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          return data.url;
        }
        return null;
      } catch (error) {
        console.error("Error uploading image:", error);
        return null;
      }
    });

    const urls = await Promise.all(uploadPromises);
    const validUrls = urls.filter((url) => url !== null) as string[];
    setUploadedImages([...uploadedImages, ...validUrls]);
    setUploadingImages(false);

    if (validUrls.length < files.length) {
      toast({
        title: "Cảnh báo",
        description: "Một số ảnh không thể tải lên",
        variant: "destructive",
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          images: uploadedImages,
        }),
      });

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Đã tạo yêu cầu bảo trì",
        });
        setFormData({ title: "", description: "", category: "" });
        setUploadedImages([]);
        setShowForm(false);
        fetchRequests();
      } else {
        const error = await response.json();
        toast({
          title: "Lỗi",
          description: error.message || "Không thể tạo yêu cầu",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi tạo yêu cầu",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Yêu cầu bảo trì</h1>
          <p className="text-muted-foreground mt-2">
            Gửi yêu cầu sửa chữa và theo dõi tiến độ
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Tạo yêu cầu mới
        </Button>
      </div>

      {/* Thông tin căn hộ */}
      {userApartment && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Thông tin căn hộ của bạn
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Số căn hộ</p>
              <p className="font-semibold">{userApartment.apartmentNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tòa nhà</p>
              <p className="font-semibold">{userApartment.building}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tầng</p>
              <p className="font-semibold">{userApartment.floor}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form tạo yêu cầu */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Tạo yêu cầu bảo trì mới</CardTitle>
            <CardDescription>
              Điền thông tin chi tiết về vấn đề cần sửa chữa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Tiêu đề</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="VD: Vòi nước bị rò rỉ"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Danh mục</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Mô tả chi tiết</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả chi tiết về vấn đề..."
                  rows={4}
                  required
                />
              </div>

              {/* Upload ảnh */}
              <div>
                <Label>Ảnh minh họa (Tối đa 5 ảnh)</Label>
                <div className="mt-2 space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploadingImages || uploadedImages.length >= 5}
                      className="cursor-pointer"
                    />
                    {uploadingImages && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                  </div>
                  
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-5 gap-2">
                      {uploadedImages.map((url, index) => (
                        <div key={index} className="relative group aspect-square">
                          <Image
                            src={url}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Gửi yêu cầu
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ title: "", description: "", category: "" });
                    setUploadedImages([]);
                  }}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Danh sách yêu cầu */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Yêu cầu của bạn</h2>
        {requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">
                Chưa có yêu cầu bảo trì nào
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
                      <div className="space-y-1">
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
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{request.description}</p>

                    {/* Thông tin căn hộ và người gửi */}
                    <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
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
                      {request.assignedTo ? (
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
                      ) : request.userId && (
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
                    </div>

                    {/* Hiển thị ảnh */}
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

                    {/* Chat Section - Only show if staff is assigned */}
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
                                      message.sender.role === "resident" ? "justify-end" : "justify-start"
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "max-w-[70%] rounded-lg p-3",
                                        message.sender.role === "resident"
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

                    <p className="text-xs text-muted-foreground">
                      Ngày tạo: {formatDate(request.createdAt)}
                    </p>
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