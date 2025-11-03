"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Bed, Bath, Maximize, Home, ChevronLeft, ChevronRight, Phone, Calendar } from "lucide-react"
import type { Apartment } from "@/lib/apartments/actions"

interface ApartmentDetailModalProps {
  apartmentId: string | null
  isOpen: boolean
  onClose: () => void
}

export function ApartmentDetailModal({ apartmentId, isOpen, onClose }: ApartmentDetailModalProps) {
  const [apartment, setApartment] = useState<Apartment | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (apartmentId && isOpen) {
      fetchApartmentDetails()
    }
  }, [apartmentId, isOpen])

  const fetchApartmentDetails = async () => {
    if (!apartmentId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/apartments/${apartmentId}`)
      if (response.ok) {
        const data = await response.json()
        setApartment(data)
        setCurrentImageIndex(0)
      }
    } catch (error) {
      console.error("Error fetching apartment details:", error)
    } finally {
      setLoading(false)
    }
  }

  const nextImage = () => {
    if (apartment?.images && apartment.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % apartment.images.length)
    }
  }

  const prevImage = () => {
    if (apartment?.images && apartment.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + apartment.images.length) % apartment.images.length)
    }
  }

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount)
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      available: { label: "Có sẵn", variant: "default" },
      occupied: { label: "Đã thuê", variant: "secondary" },
      maintenance: { label: "Bảo trì", variant: "outline" },
    }
    return statusMap[status] || statusMap.available
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[90vw] h-[85vh] p-0 overflow-hidden bg-white shadow-2xl rounded-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : apartment ? (
          <div className="flex flex-row h-full">
            {/* Left: Gallery - 65% width */}
            <div className="w-[65%] h-full relative bg-slate-900 rounded-l-2xl overflow-hidden shrink-0">
              {apartment.images && apartment.images.length > 0 ? (
                <div className="relative h-full bg-slate-900">
                  <img
                    src={apartment.images[currentImageIndex]}
                    alt={`Căn hộ ${apartment.apartmentNumber} - Ảnh ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  
                  {apartment.images.length > 1 && (
                    <>
                      {/* Navigation Buttons */}
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                      
                      {/* Dots Indicator */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {apartment.images.map((_: string, index: number) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentImageIndex 
                                ? "bg-white w-8" 
                                : "bg-white/50 hover:bg-white/75"
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                            aria-label={`Xem ảnh ${index + 1}`}
                          />
                        ))}
                      </div>

                      {/* Image Counter */}
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                        {currentImageIndex + 1} / {apartment.images.length}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="h-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center">
                  <Home className="h-20 w-20 text-slate-400 mb-4" />
                  <p className="text-slate-500 font-medium">Chưa có hình ảnh</p>
                </div>
              )}
            </div>

            {/* Right: Details - 35% width */}
            <div className="w-[35%] h-full overflow-y-auto bg-white shrink-0">
              <div className="p-6 space-y-4">
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h2 className="text-2xl font-bold text-slate-900">
                      Căn hộ {apartment.apartmentNumber}
                    </h2>
                    <Badge 
                      variant={getStatusBadge(apartment.status).variant}
                      className="text-sm px-2.5 py-1 shrink-0"
                    >
                      {getStatusBadge(apartment.status).label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">
                      {apartment.building} - Tầng {apartment.floor}
                    </span>
                  </div>
                </div>

                {/* Basic Info Card */}
                <Card className="border-0 shadow-none bg-slate-50/50">
                  <CardHeader className="pb-2 px-4 pt-3">
                    <CardTitle className="text-base font-semibold text-slate-700">Thông tin cơ bản</CardTitle>
                    <CardDescription className="text-sm text-slate-500">
                      {apartment.building} - Tầng {apartment.floor}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Bed className="h-5 w-5 text-blue-600" />
                          </div>
                          <span className="text-sm text-slate-600">Phòng ngủ</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-900">{apartment.bedrooms}</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Bath className="h-5 w-5 text-purple-600" />
                          </div>
                          <span className="text-sm text-slate-600">Phòng tắm</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-900">{apartment.bathrooms}</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-teal-100 rounded-lg">
                            <Maximize className="h-5 w-5 text-teal-600" />
                          </div>
                          <span className="text-sm text-slate-600">Diện tích sử dụng</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-900">{apartment.area} m²</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Price Card */}
                <Card className="border-0 shadow-none bg-slate-50/50">
                  <CardHeader className="pb-2 px-4 pt-3">
                    <CardTitle className="text-base font-semibold text-slate-700">Giá thuê</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <div className="py-1">
                      <div className="text-4xl font-bold text-blue-600">
                        {formatVnd(apartment.rentPrice)}
                      </div>
                      <p className="text-sm text-slate-500 mt-1">/tháng</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Description */}
                {apartment.description && (
                  <Card className="border-0 shadow-none bg-slate-50/50">
                    <CardHeader className="pb-2 px-4 pt-3">
                      <CardTitle className="text-base font-semibold text-slate-700">Mô tả</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                      <p className="text-sm text-slate-600 leading-relaxed">{apartment.description}</p>
                    </CardContent>
                  </Card>
                )}

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Button 
                    className="w-full h-12 text-sm font-semibold bg-slate-900 hover:bg-slate-800"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Liên hệ tư vấn
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full h-12 text-sm font-semibold border-2 border-slate-900 hover:bg-slate-50"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Đặt lịch xem phòng
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Home className="h-16 w-16 text-slate-400 mb-4" />
            <p className="text-slate-500 text-lg">Không tìm thấy thông tin căn hộ</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
