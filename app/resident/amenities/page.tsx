import { getAmenities } from "@/lib/amenities/actions"
import { AmenityCard } from "@/components/amenities/amenity-card"
import { Building2 } from "lucide-react"

export default async function ResidentAmenitiesPage() {
  const amenities = await getAmenities()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tiện ích & Dịch vụ</h1>
          <p className="text-muted-foreground">
            Khám phá các tiện ích và dịch vụ có sẵn trong khu căn hộ của chúng tôi
          </p>
        </div>
      </div>

      {amenities.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Chưa có tiện ích nào</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Hãy quay lại sau để xem các tiện ích và dịch vụ có sẵn.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {amenities.map((amenity) => (
            <AmenityCard key={amenity.id} amenity={amenity} />
          ))}
        </div>
      )}
    </div>
  )
}
