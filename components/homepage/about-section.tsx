"use client";

import { 
  Building2, 
  Users, 
  Home, 
  Star,
  Shield,
  Clock,
  Heart,
  Sparkles
} from "lucide-react";

interface Stats {
  totalApartments?: number;
  totalResidents?: number;
  totalAmenities?: number;
  occupancyRate?: number;
}

interface AboutSectionProps {
  stats: Stats | null;
}

export default function AboutSection({ stats }: AboutSectionProps) {
  const defaultStats = {
    totalApartments: 200,
    totalResidents: 500,
    totalAmenities: 15,
    occupancyRate: 85,
  };

  const displayStats = stats || defaultStats;

  return (
    <section id="about" className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Về chúng tôi</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
                StayEase Apartment
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                Nơi bạn tìm thấy sự kết hợp hoàn hảo giữa cuộc sống hiện đại, 
                tiện nghi cao cấp và cộng đồng cư dân văn minh, thân thiện.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Thiết kế hiện đại
                  </h3>
                  <p className="text-slate-600">
                    Căn hộ được thiết kế theo phong cách hiện đại, tối ưu không gian 
                    và ánh sáng tự nhiên, mang đến trải nghiệm sống thoải mái nhất.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Shield className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    An ninh 24/7
                  </h3>
                  <p className="text-slate-600">
                    Hệ thống an ninh hiện đại với camera giám sát, bảo vệ chuyên nghiệp 
                    đảm bảo an toàn tuyệt đối cho cư dân.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Cộng đồng thân thiện
                  </h3>
                  <p className="text-slate-600">
                    Nơi kết nối những người cùng chí hướng, xây dựng cộng đồng cư dân 
                    văn minh, tương trợ và chia sẻ.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Dịch vụ 24/7
                  </h3>
                  <p className="text-slate-600">
                    Đội ngũ quản lý và bảo trì chuyên nghiệp luôn sẵn sàng hỗ trợ bạn 
                    mọi lúc, mọi nơi.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-4 bg-blue-100 rounded-xl w-fit mb-4">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-2">
                {displayStats.totalApartments}+
              </div>
              <div className="text-slate-600 font-medium">Căn hộ</div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-4 bg-emerald-100 rounded-xl w-fit mb-4">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-2">
                {displayStats.totalResidents}+
              </div>
              <div className="text-slate-600 font-medium">Cư dân</div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-4 bg-purple-100 rounded-xl w-fit mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-2">
                {displayStats.totalAmenities}+
              </div>
              <div className="text-slate-600 font-medium">Tiện ích</div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-4 bg-amber-100 rounded-xl w-fit mb-4">
                <Home className="h-8 w-8 text-amber-600" />
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-2">
                {displayStats.occupancyRate}%
              </div>
              <div className="text-slate-600 font-medium">Lấp đầy</div>
            </div>
          </div>
        </div>

        {/* Location / Map Section (Optional) */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Vị trí đắc địa
          </h3>
          <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden">
            {/* You can integrate Google Maps or Mapbox here */}
            <div className="h-full flex items-center justify-center text-slate-400">
              <div className="text-center space-y-2">
                <Building2 className="h-16 w-16 mx-auto" />
                <p className="text-lg">Bản đồ vị trí chung cư</p>
                <p className="text-sm">Trung tâm thành phố, gần các tiện ích công cộng</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
