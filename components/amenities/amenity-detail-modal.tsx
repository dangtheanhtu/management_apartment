"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Clock, Star, X, ChevronLeft, ChevronRight } from "lucide-react"
import type { AmenityDetail } from "@/lib/types/user"

interface AmenityDetailModalProps {
  amenityId: string | null
  isOpen: boolean
  onClose: () => void
}

// Hàm việt hóa tên tiện ích
function getAmenityDisplayName(name: string): string {
  const amenityNames: Record<string, string> = {
    "Community Hall": "Sảnh cộng đồng",
    "Package Room": "Phòng nhận hàng",
    "Parking": "Bãi đỗ xe",
    "Fitness Center": "Phòng gym",
    "Playground": "Sân chơi trẻ em",
    "Swimming Pool": "Hồ bơi",
    "Security": "An ninh",
    "Maintenance": "Bảo trì",
    "Laundry": "Phòng giặt",
    "Library": "Thư viện",
    "Game Room": "Phòng game",
    "BBQ Area": "Khu nướng BBQ",
    "Garden": "Khu vườn",
    "Rooftop": "Sân thượng"
  }
  
  return amenityNames[name] || name
}

export function AmenityDetailModal({ amenityId, isOpen, onClose }: AmenityDetailModalProps) {
  const [amenity, setAmenity] = useState<AmenityDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (amenityId && isOpen) {
      fetchAmenityDetails()
    }
  }, [amenityId, isOpen])

  const fetchAmenityDetails = async () => {
    if (!amenityId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/amenities/${amenityId}`)
      if (response.ok) {
        const data = await response.json()
        setAmenity(data)
      }
    } catch (error) {
      console.error("Error fetching amenity details:", error)
    } finally {
      setLoading(false)
    }
  }

  const nextImage = () => {
    if (amenity?.images.length) {
      setCurrentImageIndex((prev) => (prev + 1) % amenity.images.length)
    }
  }

  const prevImage = () => {
    if (amenity?.images.length) {
      setCurrentImageIndex((prev) => (prev - 1 + amenity.images.length) % amenity.images.length)
    }
  }

  if (!amenity && !loading) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {amenity ? getAmenityDisplayName(amenity.name) : "Chi tiết tiện ích"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : amenity ? (
          <div className="space-y-6">
            {/* Image Carousel */}
            {amenity.images.length > 0 ? (
              <div className="relative">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={amenity.images[currentImageIndex].url}
                    alt={amenity.images[currentImageIndex].alt_text || getAmenityDisplayName(amenity.name)}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {amenity.images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {amenity.images.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentImageIndex ? "bg-white" : "bg-white/50"
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Star className="h-12 w-12 mx-auto mb-2" />
                  <p>Chưa có hình ảnh</p>
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Thông tin cơ bản</h3>
                    
                    <div className="space-y-3">
                      {amenity.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">Vị trí:</span>
                          <span>{amenity.location}</span>
                        </div>
                      )}
                      
                      {amenity.operating_hours && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">Giờ hoạt động:</span>
                          <span>{amenity.operating_hours}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={amenity.status === "active" ? "default" : "secondary"}>
                          {amenity.status === "active" ? "Hoạt động" : "Tạm ngưng"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Liên hệ</h3>
                    
                    <div className="space-y-2">
                      <Button className="w-full" size="lg">
                        Đặt lịch sử dụng
                      </Button>
                      <Button variant="outline" className="w-full">
                        Liên hệ hỗ trợ
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {amenity.description && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Mô tả chi tiết</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {amenity.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
