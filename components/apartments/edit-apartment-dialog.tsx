"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updateApartment, type Apartment } from "@/lib/apartments/actions"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { ApartmentImagesUpload } from "./apartment-images-upload"

interface EditApartmentDialogProps {
  apartment: Apartment
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditApartmentDialog({ apartment, open, onOpenChange }: EditApartmentDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>(apartment.images || [])
  
  // Form state
  const [formData, setFormData] = useState({
    apartment_number: apartment.apartmentNumber || "",
    building: apartment.building || "",
    floor: apartment.floor.toString(),
    bedrooms: apartment.bedrooms.toString(),
    bathrooms: apartment.bathrooms.toString(),
    area_sqm: apartment.area.toString(),
    rent_amount: apartment.rentPrice.toString(),
    status: apartment.status
  })
  
  // Reset form when dialog opens with new apartment
  useEffect(() => {
    if (open) {
      setFormData({
        apartment_number: apartment.apartmentNumber || "",
        building: apartment.building || "",
        floor: apartment.floor.toString(),
        bedrooms: apartment.bedrooms.toString(),
        bathrooms: apartment.bathrooms.toString(),
        area_sqm: apartment.area.toString(),
        rent_amount: apartment.rentPrice.toString(),
        status: apartment.status
      })
      setImages(apartment.images || [])
    }
  }, [open, apartment])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    console.log('[EDIT APARTMENT] Form data:', formData)
    console.log('[EDIT APARTMENT] Images:', images)

    try {
      const result = await updateApartment(apartment.id, {
        apartmentNumber: formData.apartment_number,
        floor: Number.parseInt(formData.floor),
        building: formData.building || null,
        bedrooms: Number.parseInt(formData.bedrooms),
        bathrooms: Number.parseInt(formData.bathrooms),
        area: Number.parseFloat(formData.area_sqm),
        rentPrice: Number.parseFloat(formData.rent_amount),
        status: formData.status as "available" | "occupied" | "maintenance",
        images: images,
      })

      console.log('[EDIT APARTMENT] Update result:', result)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Cập nhật căn hộ thành công")
        onOpenChange(false)
        router.refresh()
      }
    } catch (err) {
      console.error('[EDIT APARTMENT] Error:', err)
      toast.error(err instanceof Error ? err.message : "Không thể cập nhật căn hộ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa căn hộ</DialogTitle>
          <DialogDescription>Cập nhật thông tin đơn vị căn hộ</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Ảnh căn hộ</Label>
              <ApartmentImagesUpload 
                defaultImages={images}
                onImagesChange={setImages}
                maxImages={10}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apartment_number">Số căn hộ *</Label>
                <Input
                  id="apartment_number"
                  value={formData.apartment_number}
                  onChange={(e) => setFormData({...formData, apartment_number: e.target.value})}
                  placeholder="VD: 101, A-201"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="building">Tòa nhà</Label>
                <Input 
                  id="building" 
                  value={formData.building}
                  onChange={(e) => setFormData({...formData, building: e.target.value})}
                  placeholder="VD: Tòa A, Tòa B"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="floor">Tầng *</Label>
                <Input 
                  id="floor" 
                  type="number" 
                  min="0" 
                  value={formData.floor}
                  onChange={(e) => setFormData({...formData, floor: e.target.value})}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedrooms">Phòng ngủ *</Label>
                <Input 
                  id="bedrooms" 
                  type="number" 
                  min="0" 
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Phòng tắm *</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min="0"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area_sqm">Diện tích (m²) *</Label>
                <Input
                  id="area_sqm"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.area_sqm}
                  onChange={(e) => setFormData({...formData, area_sqm: e.target.value})}
                  placeholder="VD: 60, 80.5"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rent_amount">Tiền thuê hàng tháng (VNĐ) *</Label>
                <Input
                  id="rent_amount"
                  type="number"
                  step="1000"
                  min="0"
                  value={formData.rent_amount}
                  onChange={(e) => setFormData({...formData, rent_amount: e.target.value})}
                  placeholder="VD: 8000000"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({...formData, status: value as any})}
                required
              >
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
