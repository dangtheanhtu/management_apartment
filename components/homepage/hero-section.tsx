"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Building2, Sparkles, ArrowRight } from "lucide-react";
import { Session } from "next-auth";

interface HeroSectionProps {
  session: Session | null;
}

export default function HeroSection({ session }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="relative min-h-[700px] flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 pt-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:radial-gradient(white,transparent_85%)]" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-slate-200">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-slate-700">
              Chào mừng đến với StayEase Apartment
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Cuộc sống cao cấp
            </span>
            <br />
            <span className="text-gradient">
              Bắt đầu từ đây
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Khám phá không gian sống sang trọng với đầy đủ tiện nghi hiện đại,
            phục vụ tận tâm và cộng đồng cư dân văn minh.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
              <div className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden">
                <Search className="absolute left-6 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm căn hộ, tiện ích, dịch vụ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 pl-14 pr-4 py-7 text-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="m-2 px-8 bg-primary hover:bg-primary/90"
                >
                  Tìm kiếm
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {session ? (
              <>
                <Button
                  asChild
                  size="lg"
                  className="px-8 bg-primary hover:bg-primary/90 shadow-lg"
                >
                  <Link href="/dashboard">
                    <Building2 className="mr-2 h-5 w-5" />
                    Vào Dashboard
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="px-8 bg-white/80 backdrop-blur-sm border-2 hover:bg-white"
                >
                  <Link href="/community">Khám phá cộng đồng</Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  className="px-8 bg-primary hover:bg-primary/90 shadow-lg"
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
                  className="px-8 bg-white/80 backdrop-blur-sm border-2 hover:bg-white"
                >
                  <Link href="/login">Đăng nhập</Link>
                </Button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
            <div className="space-y-1">
              <div className="text-3xl font-bold text-slate-900">200+</div>
              <div className="text-sm text-slate-600">Căn hộ</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-slate-900">15+</div>
              <div className="text-sm text-slate-600">Tiện ích</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-slate-900">500+</div>
              <div className="text-sm text-slate-600">Cư dân</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
