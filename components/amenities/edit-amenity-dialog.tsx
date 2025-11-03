"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Loader2 } from "lucide-react"
import { updateAmenity } from "@/lib/amenities/actions"
import { AmenityImageUpload } from "./amenity-image-upload"
import { toast } from "sonner"

interface EditAmenityDialogProps {
  amenity: any
  onSuccess?: () => void
}

export function EditAmenityDialog({ amenity, onSuccess }: EditAmenityDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(amenity.imageUrl || null)
  const [formData, setFormData] = useState({
    name: amenity.name || "",
    description: amenity.description || "",
    location: amenity.location || "",
    operatingHours: amenity.operatingHours || amenity.operating_hours || "",
    type: amenity.type || "facility",
    status: amenity.status || "active",
  })

  useEffect(() => {
    if (open) {
      setFormData({
        name: amenity.name || "",
        description: amenity.description || "",
        location: amenity.location || "",
        operatingHours: amenity.operatingHours || amenity.operating_hours || "",
        type: amenity.type || "facility",
        status: amenity.status || "active",
      })
      setImageUrl(amenity.imageUrl || null)
    }
  }, [open, amenity])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const data = {
      name: formData.name,
      type: formData.type,
      description: formData.description,
      location: formData.location,
      operatingHours: formData.operatingHours,
      status: formData.status,
      imageUrl: imageUrl || undefined,
    }

    console.log("Updating amenity with data:", data)

    const result = await updateAmenity(amenity.id, data)

    console.log("Update result:", result)

    setIsLoading(false)

    if (result.success) {
      toast.success("Cập nhật tiện ích thành công")
      setOpen(false)
      if (onSuccess) {
        console.log("Calling onSuccess to refresh data...")
        onSuccess()
      }
    } else {
      toast.error(result.error || "Có lỗi xảy ra khi cập nhật tiện ích")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
          <Pencil className="mr-2 h-4 w-4" />
          Chỉnh sửa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa tiện ích</DialogTitle>
            <DialogDescription>Cập nhật thông tin chi tiết của tiện ích</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="image">Hình ảnh tiện ích</Label>
              <AmenityImageUpload
                defaultImage={imageUrl}
                onImageChange={setImageUrl}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Tên tiện ích *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ borderRadius: "8px" }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Loại tiện ích *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                required
              >
                <SelectTrigger style={{ borderRadius: "8px" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facility">Cơ sở vật chất</SelectItem>
                  <SelectItem value="service">Dịch vụ</SelectItem>
                  <SelectItem value="equipment">Thiết bị</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
                style={{ borderRadius: "8px" }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Vị trí</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={{ borderRadius: "8px" }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="operatingHours">Giờ hoạt động</Label>
              <Input
                id="operatingHours"
                value={formData.operatingHours}
                onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                style={{ borderRadius: "8px" }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Trạng thái *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                required
              >
                <SelectTrigger style={{ borderRadius: "8px" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="maintenance">Đang bảo trì</SelectItem>
                  <SelectItem value="inactive">Ngưng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
