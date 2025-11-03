"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Bed, 
  Bath, 
  Maximize, 
  MapPin, 
  ArrowRight,
  Sparkles 
} from "lucide-react";

interface Apartment {
  id: string;
  apartmentNumber: string;
  building?: string;
  floor: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  rentPrice: number;
  status: string;
  images?: string[];
  description?: string;
}

interface AvailableUnitsSectionProps {
  apartments: Apartment[];
}

export default function AvailableUnitsSection({ apartments }: AvailableUnitsSectionProps) {
  const availableApartments = apartments.filter(apt => 
    apt.status === "AVAILABLE" || apt.status === "available"
  ).slice(0, 6);

  if (availableApartments.length === 0) {
    return (
      <section id="apartments" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4">
            <Home className="h-16 w-16 text-slate-300 mx-auto" />
            <h3 className="text-2xl font-semibold text-slate-700">
              Hiện chưa có căn hộ trống
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Vui lòng quay lại sau để xem các căn hộ mới hoặc liên hệ với chúng tôi để được tư vấn.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="apartments" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Căn hộ còn trống</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
            Khám phá không gian sống lý tưởng
          </h2>
          <p className="text-xl text-slate-600">
            Tìm căn hộ hoàn hảo cho gia đình bạn với đầy đủ tiện nghi hiện đại
          </p>
        </div>

        {/* Apartments Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {availableApartments.map((apartment) => (
            <Card 
              key={apartment.id} 
              className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden bg-slate-100">
                {apartment.images && apartment.images.length > 0 ? (
                  <Image
                    src={apartment.images[0]}
                    alt={`Căn hộ ${apartment.apartmentNumber}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <Home className="h-16 w-16 text-slate-300" />
                  </div>
                )}
                
                {/* Image Badge */}
                {apartment.images && apartment.images.length > 1 && (
                  <Badge className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white border-0">
                    +{apartment.images.length - 1} ảnh
                  </Badge>
                )}

                {/* Status Badge */}
                <Badge className="absolute top-4 left-4 bg-emerald-500 text-white border-0">
                  Có sẵn
                </Badge>
              </div>

              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    {apartment.apartmentNumber}
                  </CardTitle>
                  <Badge variant="outline" className="text-slate-600">
                    {apartment.building || "Tòa A"}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="h-4 w-4" />
                  Tầng {apartment.floor}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl">
                    <Bed className="h-5 w-5 text-slate-600 mb-2" />
                    <span className="text-lg font-semibold text-slate-900">
                      {apartment.bedrooms}
                    </span>
                    <span className="text-xs text-slate-500">Phòng ngủ</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl">
                    <Bath className="h-5 w-5 text-slate-600 mb-2" />
                    <span className="text-lg font-semibold text-slate-900">
                      {apartment.bathrooms}
                    </span>
                    <span className="text-xs text-slate-500">Phòng tắm</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl">
                    <Maximize className="h-5 w-5 text-slate-600 mb-2" />
                    <span className="text-lg font-semibold text-slate-900">
                      {apartment.area}
                    </span>
                    <span className="text-xs text-slate-500">m²</span>
                  </div>
                </div>

                {/* Price */}
                <div className="pt-4 border-t">
                  <div className="text-sm text-slate-500 mb-1">Giá thuê</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(apartment.rentPrice)}
                    <span className="text-lg text-slate-500 font-normal">/tháng</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button 
                  asChild
                  className="w-full group/btn bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  <Link href={`/search?id=${apartment.id}`}>
                    Xem chi tiết
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        {availableApartments.length > 0 && (
          <div className="text-center mt-16">
            <Button 
              asChild
              size="lg" 
              variant="outline"
              className="px-8 border-2 hover:bg-slate-50"
            >
              <Link href="/search">
                Xem tất cả căn hộ
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
