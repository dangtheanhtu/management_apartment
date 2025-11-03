"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ApartmentDetailModal } from "@/components/apartments/apartment-detail-modal"
import { Home, Bed, Bath, Maximize, MapPin, Search, SlidersHorizontal, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [apartments, setApartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null)

  useEffect(() => {
    const fetchApartments = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/apartments')
        const data = await response.json()
        
        let filtered = data.apartments || []
        
        // Apply filters
        const query = searchParams.get('q')
        const status = searchParams.get('status')
        const bedrooms = searchParams.get('bedrooms')
        const minPrice = searchParams.get('minPrice')
        const maxPrice = searchParams.get('maxPrice')
        const minArea = searchParams.get('minArea')
        const maxArea = searchParams.get('maxArea')

        if (query) {
          filtered = filtered.filter((apt: any) => 
            apt.apartmentNumber?.toLowerCase().includes(query.toLowerCase()) ||
            apt.description?.toLowerCase().includes(query.toLowerCase()) ||
            apt.building?.toLowerCase().includes(query.toLowerCase())
          )
        }

        if (status && status !== 'all') {
          filtered = filtered.filter((apt: any) => apt.status === status)
        }

        if (bedrooms) {
          filtered = filtered.filter((apt: any) => apt.bedrooms >= parseInt(bedrooms))
        }

        if (minPrice) {
          filtered = filtered.filter((apt: any) => apt.rentPrice >= parseInt(minPrice))
        }

        if (maxPrice) {
          filtered = filtered.filter((apt: any) => apt.rentPrice <= parseInt(maxPrice))
        }

        if (minArea) {
          filtered = filtered.filter((apt: any) => apt.area >= parseInt(minArea))
        }

        if (maxArea) {
          filtered = filtered.filter((apt: any) => apt.area <= parseInt(maxArea))
        }

        setApartments(filtered)
      } catch (error) {
        console.error('Error fetching apartments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchApartments()
  }, [searchParams])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StayEase
              </span>
            </Link>
            <div className="flex gap-3">
              <Button variant="ghost" asChild>
                <Link href="/">Trang chủ</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/login">Đăng nhập</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Kết quả tìm kiếm</h1>
            <p className="text-muted-foreground">
              {loading ? (
                "Đang tìm kiếm..."
              ) : (
                `Tìm thấy ${apartments.length} căn hộ`
              )}
            </p>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
          ) : apartments.length === 0 ? (
            <div className="text-center py-20">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold mb-2">Không tìm thấy kết quả</h3>
              <p className="text-muted-foreground mb-6">
                Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
              </p>
              <Button asChild>
                <Link href="/">Quay về trang chủ</Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apartments.map((apartment) => (
                <Card 
                  key={apartment.id} 
                  className="group overflow-hidden hover:shadow-xl transition-all border-none shadow-md bg-white rounded-2xl"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden bg-slate-900">
                    {apartment.images && apartment.images.length > 0 ? (
                      <img
                        src={apartment.images[0]}
                        alt={`Căn hộ ${apartment.apartmentNumber}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : apartment.imageUrl ? (
                      <img
                        src={apartment.imageUrl}
                        alt={`Căn hộ ${apartment.apartmentNumber}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                        <Home className="h-16 w-16 text-slate-400" />
                      </div>
                    )}
                    
                    <Badge className={`absolute top-3 left-3 ${
                      apartment.status === 'available' 
                        ? 'bg-green-500' 
                        : apartment.status === 'occupied'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    } text-white border-none`}>
                      {apartment.status === 'available' ? 'Còn trống' : apartment.status === 'occupied' ? 'Đã thuê' : 'Bảo trì'}
                    </Badge>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-xl font-bold">
                        {apartment.apartmentNumber}
                      </CardTitle>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">
                          {formatPrice(apartment.rentPrice)}
                        </div>
                        <div className="text-xs text-muted-foreground">/ tháng</div>
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {apartment.building || "Tòa chính"} • Tầng {apartment.floor}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg">
                        <Bed className="h-4 w-4 text-blue-600 mb-1" />
                        <span className="text-sm font-bold">{apartment.bedrooms}</span>
                        <span className="text-xs text-muted-foreground">PN</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg">
                        <Bath className="h-4 w-4 text-blue-600 mb-1" />
                        <span className="text-sm font-bold">{apartment.bathrooms}</span>
                        <span className="text-xs text-muted-foreground">PT</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg">
                        <Maximize className="h-4 w-4 text-blue-600 mb-1" />
                        <span className="text-sm font-bold">{apartment.area}</span>
                        <span className="text-xs text-muted-foreground">m²</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl"
                      onClick={() => setSelectedApartmentId(apartment.id)}
                    >
                      Xem chi tiết
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <ApartmentDetailModal
        apartmentId={selectedApartmentId}
        isOpen={!!selectedApartmentId}
        onClose={() => setSelectedApartmentId(null)}
      />
    </div>
  )
}
