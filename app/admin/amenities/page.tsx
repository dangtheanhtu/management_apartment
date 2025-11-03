"use client"

import { useState, useEffect } from "react"
import { getAmenities } from "@/lib/amenities/actions"
import { AmenityCard } from "@/components/amenities/amenity-card"
import { CreateAmenityDialog } from "@/components/amenities/create-amenity-dialog"
import { Building2, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Amenity {
  id: string
  name: string
  description: string
  type?: string
  location?: string
  operatingHours?: string
  operating_hours?: string
  status: string
  imageUrl?: string
  images?: string[]
}

export default function AdminAmenitiesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAmenities = async () => {
    try {
      setLoading(true)
      console.log("Fetching amenities...")
      const data = await getAmenities()
      console.log("Fetched amenities:", data)
      console.log("Amenities with images:", data.filter(a => a.imageUrl))
      setAmenities(data)
    } catch (error) {
      console.error("Error fetching amenities:", error)
      toast.error("Không thể tải danh sách tiện ích")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAmenities()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý tiện ích</h1>
            <p className="text-muted-foreground">Quản lý các tiện ích và dịch vụ cho khu căn hộ</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchAmenities} disabled={loading}>
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <CreateAmenityDialog onSuccess={fetchAmenities} />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-lg border bg-card animate-pulse" />
          ))}
        </div>
      ) : amenities.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Chưa có tiện ích nào</h3>
            <p className="mt-2 text-sm text-muted-foreground">Bắt đầu bằng cách thêm tiện ích đầu tiên.</p>
            <div className="mt-4">
              <CreateAmenityDialog onSuccess={fetchAmenities} />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {amenities.map((amenity) => (
            <AmenityCard key={amenity.id} amenity={amenity} isAdmin onUpdate={fetchAmenities} />
          ))}
        </div>
      )}
    </div>
  )
}
