"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createApartment } from "@/lib/apartments/actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus } from "lucide-react"
import { ApartmentImagesUpload } from "./apartment-images-upload"
import { toast } from "sonner"

export function CreateApartmentDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setImages([])
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    
    const data: any = {
      apartmentNumber: form.apartment_number.value,
      floor: parseInt(form.floor.value),
      building: form.building.value || "",
      bedrooms: parseInt(form.bedrooms.value),
      bathrooms: parseInt(form.bathrooms.value),
      area: parseFloat(form.area_sqm.value),
      rentPrice: parseFloat(form.rent_amount.value),
      status: form.status.value as "available" | "occupied" | "maintenance",
      description: "",
      images: images, // Send array of image URLs
    }

    console.log("Creating apartment with data:", data)
    console.log("Images array:", images)
    console.log("Has images in data:", images.length > 0)

    try {
      const result = await createApartment(data)
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Thêm căn hộ thành công")
      setOpen(false)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể tạo căn hộ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Thêm căn hộ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm căn hộ mới</DialogTitle>
          <DialogDescription>Tạo một đơn vị căn hộ mới trong hệ thống</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="images">Hình ảnh căn hộ</Label>
              <ApartmentImagesUpload
                defaultImages={images}
                onImagesChange={setImages}
                maxImages={10}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apartment_number">Số căn hộ *</Label>
                <Input id="apartment_number" name="apartment_number" placeholder="A101" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="building">Tòa nhà</Label>
                <Input id="building" name="building" placeholder="Tòa A" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="floor">Tầng *</Label>
                <Input id="floor" name="floor" type="number" min="0" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedrooms">Phòng ngủ *</Label>
                <Input id="bedrooms" name="bedrooms" type="number" min="0" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Phòng tắm *</Label>
                <Input id="bathrooms" name="bathrooms" type="number" min="0" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area_sqm">Diện tích (m²) *</Label>
                <Input 
                  id="area_sqm" 
                  name="area_sqm" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  placeholder="VD: 60, 80.5"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rent_amount">Tiền thuê hàng tháng (VNĐ) *</Label>
                <Input 
                  id="rent_amount" 
                  name="rent_amount" 
                  type="number" 
                  step="1000" 
                  min="0" 
                  placeholder="VD: 8000000"
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái *</Label>
              <Select name="status" defaultValue="available" required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Có sẵn</SelectItem>
                  <SelectItem value="occupied">Đã thuê</SelectItem>
                  <SelectItem value="maintenance">Bảo trì</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tạo căn hộ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
