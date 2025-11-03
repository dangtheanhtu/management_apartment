import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Image as ImageIcon } from "lucide-react"
import { EditAmenityDialog } from "./edit-amenity-dialog"
import { DeleteAmenityDialog } from "./delete-amenity-dialog"

interface AmenityCardProps {
  amenity: any
  isAdmin?: boolean
  onUpdate?: () => void
}

export function AmenityCard({ amenity, isAdmin = false, onUpdate }: AmenityCardProps) {
  console.log("AmenityCard rendering:", { 
    name: amenity.name, 
    imageUrl: amenity.imageUrl,
    hasImage: !!amenity.imageUrl 
  })
  
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      active: { label: "Đang hoạt động", class: "bg-green-500/10 text-green-500 hover:bg-green-500/20" },
      maintenance: { label: "Đang bảo trì", class: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20" },
      inactive: { label: "Ngưng hoạt động", class: "bg-red-500/10 text-red-500 hover:bg-red-500/20" },
      available: { label: "Đang hoạt động", class: "bg-green-500/10 text-green-500 hover:bg-green-500/20" },
      closed: { label: "Ngưng hoạt động", class: "bg-red-500/10 text-red-500 hover:bg-red-500/20" },
    }
    const statusInfo = statusMap[status] || statusMap.active
    return <Badge className={statusInfo.class} variant="secondary">{statusInfo.label}</Badge>
  }

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      facility: "Cơ sở vật chất",
      service: "Dịch vụ",
      equipment: "Thiết bị",
    }
    return typeMap[type] || type
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      {amenity.imageUrl && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img
            src={amenity.imageUrl}
            alt={amenity.name}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      {!amenity.imageUrl && (
        <div className="aspect-video w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-xl">{amenity.name}</CardTitle>
            {amenity.type && (
              <p className="text-xs text-muted-foreground">{getTypeLabel(amenity.type)}</p>
            )}
            <CardDescription className="line-clamp-2">{amenity.description}</CardDescription>
          </div>
          {getStatusBadge(amenity.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {amenity.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">📍 {amenity.location}</span>
          </div>
        )}
        {(amenity.operating_hours || amenity.operatingHours) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">⏰ {amenity.operating_hours || amenity.operatingHours}</span>
          </div>
        )}

        {isAdmin && (
          <div className="flex gap-2 pt-2 border-t">
            <EditAmenityDialog amenity={amenity} onSuccess={onUpdate} />
            <DeleteAmenityDialog amenityId={amenity.id} amenityName={amenity.name} onSuccess={onUpdate} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
