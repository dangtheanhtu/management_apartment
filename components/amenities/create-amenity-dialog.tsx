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
import { Plus, Loader2 } from "lucide-react"
import { createAmenity } from "@/lib/amenities/actions"
import { AmenityImageUpload } from "./amenity-image-upload"
import { toast } from "sonner"

interface CreateAmenityDialogProps {
  onSuccess?: () => void
}

export function CreateAmenityDialog({ onSuccess }: CreateAmenityDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    operatingHours: "",
    type: "facility",
    status: "active",
  })

  // Debug log when imageUrl changes
  useEffect(() => {
    console.log("CreateDialog imageUrl changed:", imageUrl)
  }, [imageUrl])

  useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        description: "",
        location: "",
        operatingHours: "",
        type: "facility",
        status: "active",
      })
      setImageUrl(null)
    }
  }, [open])

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
      imageUrl: imageUrl || "",
    }

    console.log("Creating amenity with data:", data)
    console.log("ImageUrl value:", imageUrl)
    console.log("Has imageUrl:", !!imageUrl)

    const result = await createAmenity(data)

    setIsLoading(false)

    if (result.success) {
      toast.success("Tạo tiện ích thành công")
      setOpen(false)
      if (onSuccess) {
        console.log("Calling onSuccess to refresh data...")
        onSuccess()
      }
    } else {
      toast.error(result.error || "Có lỗi xảy ra khi tạo tiện ích")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Thêm tiện ích
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Thêm tiện ích mới</DialogTitle>
            <DialogDescription>Thêm một tiện ích hoặc dịch vụ mới cho khu căn hộ</DialogDescription>
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
                placeholder="Ví dụ: Hồ bơi, Phòng gym..."
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
                placeholder="Mô tả chi tiết về tiện ích..."
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
                placeholder="Ví dụ: Tòa A, Tầng 2"
                style={{ borderRadius: "8px" }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="operatingHours">Giờ hoạt động</Label>
              <Input
                id="operatingHours"
                value={formData.operatingHours}
                onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                placeholder="Ví dụ: 6:00 - 22:00"
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
              Tạo tiện ích
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
