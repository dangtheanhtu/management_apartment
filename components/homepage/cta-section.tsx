"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Mail, MapPin } from "lucide-react";
import { Session } from "next-auth";

interface CtaSectionProps {
  session: Session | null;
}

export default function CtaSection({ session }: CtaSectionProps) {
  return (
    <section className="py-24 bg-gradient-to-br from-primary via-accent to-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-6">
        {session ? (
          // Logged In CTA
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Chào mừng trở lại, {session.user?.name || "bạn"}!
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Tiếp tục quản lý căn hộ, xem hóa đơn, yêu cầu dịch vụ và khám phá 
              các tiện ích mới từ dashboard của bạn.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button 
                asChild
                size="lg" 
                className="px-8 bg-white text-primary hover:bg-orange-50"
              >
                <Link href="/dashboard">
                  Vào Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="outline"
                className="px-8 border-2 border-white text-white hover:bg-white/10"
              >
                <Link href="/community">
                  Khám phá cộng đồng
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          // Guest CTA
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Sẵn sàng trở thành cư dân?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Đăng ký ngay hôm nay để khám phá không gian sống lý tưởng và 
              trải nghiệm cuộc sống đẳng cấp tại StayEase Apartment.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button 
                asChild
                size="lg" 
                className="px-8 bg-white text-primary hover:bg-orange-50"
              >
                <Link href="/register">
                  Đăng ký ngay
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="outline"
                className="px-8 border-2 border-white text-white hover:bg-white/10"
              >
                <Link href="/login">
                  Đăng nhập
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="mt-16 pt-16 border-t border-white/20">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl mb-2">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div className="text-sm text-blue-100">Hotline</div>
              <div className="text-lg font-semibold text-white">1900 xxxx</div>
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl mb-2">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div className="text-sm text-blue-100">Email</div>
              <div className="text-lg font-semibold text-white">info@stayease.vn</div>
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl mb-2">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div className="text-sm text-blue-100">Địa chỉ</div>
              <div className="text-lg font-semibold text-white">TP. Hồ Chí Minh</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
