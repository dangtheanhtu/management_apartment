"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell, 
  Waves, 
  Coffee, 
  Car, 
  Shield, 
  Sparkles,
  MapPin,
  Clock,
  ArrowRight
} from "lucide-react";

interface Amenity {
  id: string;
  name: string;
  description?: string;
  location?: string;
  imageUrl?: string;
  status: string;
  operatingHours?: string;
  operating_hours?: string;
}

interface AmenitiesSectionProps {
  amenities: Amenity[];
}

const getAmenityIcon = (name: string) => {
  const nameLower = name.toLowerCase();
  if (nameLower.includes("gym") || nameLower.includes("fitness")) {
    return Dumbbell;
  }
  if (nameLower.includes("pool") || nameLower.includes("swim") || nameLower.includes("bơi")) {
    return Waves;
  }
  if (nameLower.includes("cafe") || nameLower.includes("coffee")) {
    return Coffee;
  }
  if (nameLower.includes("park") || nameLower.includes("đỗ xe")) {
    return Car;
  }
  if (nameLower.includes("security") || nameLower.includes("an ninh")) {
    return Shield;
  }
  return Sparkles;
};

const getStatusInfo = (status: string) => {
  const statusMap: Record<string, { label: string; className: string }> = {
    ACTIVE: { label: "Hoạt động", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    active: { label: "Hoạt động", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    MAINTENANCE: { label: "Bảo trì", className: "bg-amber-100 text-amber-700 border-amber-200" },
    maintenance: { label: "Bảo trì", className: "bg-amber-100 text-amber-700 border-amber-200" },
    INACTIVE: { label: "Tạm ngưng", className: "bg-slate-100 text-slate-700 border-slate-200" },
    inactive: { label: "Tạm ngưng", className: "bg-slate-100 text-slate-700 border-slate-200" },
  };
  return statusMap[status] || statusMap.ACTIVE;
};

export default function AmenitiesSection({ amenities }: AmenitiesSectionProps) {
  const featuredAmenities = amenities.slice(0, 6);

  if (featuredAmenities.length === 0) {
    return (
      <section id="amenities" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4">
            <Sparkles className="h-16 w-16 text-slate-300 mx-auto" />
            <h3 className="text-2xl font-semibold text-slate-700">
              Tiện ích đang được cập nhật
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Chúng tôi đang chuẩn bị các tiện ích tuyệt vời để phục vụ bạn
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="amenities" className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Tiện ích & Lifestyle</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
            Trải nghiệm cuộc sống đẳng cấp
          </h2>
          <p className="text-xl text-slate-600">
            Hệ thống tiện ích cao cấp phục vụ mọi nhu cầu của bạn
          </p>
        </div>

        {/* Amenities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredAmenities.map((amenity) => {
            const Icon = getAmenityIcon(amenity.name);
            const statusInfo = getStatusInfo(amenity.status);

            return (
              <Card 
                key={amenity.id}
                className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white"
              >
                {/* Image or Icon */}
                <div className="relative h-56 overflow-hidden">
                  {amenity.imageUrl ? (
                    <Image
                      src={amenity.imageUrl}
                      alt={amenity.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                      <Icon className="h-20 w-20 text-slate-300" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <Badge className={`absolute top-4 right-4 ${statusInfo.className} backdrop-blur-sm`}>
                    {statusInfo.label}
                  </Badge>
                </div>

                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Icon className="h-5 w-5 text-blue-600" />
                      {amenity.name}
                    </CardTitle>
                  </div>
                  <CardDescription className="line-clamp-2 text-slate-600">
                    {amenity.description || "Tiện ích cao cấp phục vụ cư dân"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Location */}
                  {amenity.location && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="line-clamp-1">{amenity.location}</span>
                    </div>
                  )}

                  {/* Operating Hours */}
                  {(amenity.operatingHours || amenity.operating_hours) && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="line-clamp-1">
                        {amenity.operatingHours || amenity.operating_hours}
                      </span>
                    </div>
                  )}

                  {/* CTA Button */}
                  <Button 
                    asChild
                    variant="outline" 
                    className="w-full group/btn hover:bg-slate-50"
                  >
                    <Link href={`/search?amenity=${amenity.id}`}>
                      Xem chi tiết
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* View All Button */}
        {featuredAmenities.length > 0 && (
          <div className="text-center mt-16">
            <Button 
              asChild
              size="lg" 
              variant="outline"
              className="px-8 border-2 hover:bg-white"
            >
              <Link href="/search?type=amenities">
                Xem tất cả tiện ích
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
