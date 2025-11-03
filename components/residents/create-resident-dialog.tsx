"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createResident } from "@/lib/residents/actions"
import { getAllUsers } from "@/lib/users/actions"
import { getAllApartments } from "@/lib/apartments/actions"
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
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface CreateResidentDialogProps {
  children: React.ReactNode
  onSuccess?: () => void
}

export function CreateResidentDialog({ children, onSuccess }: CreateResidentDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [apartments, setApartments] = useState<any[]>([])
  const [formData, setFormData] = useState({
    user_id: "",
    apartment_id: "",
    move_in_date: "",
    lease_start_date: "",
    lease_end_date: "",
    deposit_amount: "",
    monthly_rent: "",
    status: "active" as "active" | "inactive" | "terminated",
  })

  useEffect(() => {
    if (open) {
      loadData()
      // Reset form when opening
      setFormData({
        user_id: "",
        apartment_id: "",
        move_in_date: "",
        lease_start_date: "",
        lease_end_date: "",
        deposit_amount: "",
        monthly_rent: "",
        status: "active",
      })
    }
  }, [open])

  const loadData = async () => {
    try {
      const [usersResult, apartmentsData] = await Promise.all([getAllUsers(), getAllApartments()])
      const usersData = usersResult.success ? usersResult.data : []
      
      // Only show residents who haven't been assigned to any apartment
      const unassignedResidents = usersData.filter((u: any) => 
        u.role === "resident" && !u.apartment_id && !u.apartmentId
      )
      
      // Only show apartments that are available (not occupied)
      const availableApartments = apartmentsData.filter((a: any) => 
        a.status === "available"
      )
      
      console.log("Unassigned residents:", unassignedResidents)
      console.log("Available apartments:", availableApartments)
      
      setUsers(unassignedResidents)
      setApartments(availableApartments)
    } catch (error) {
      console.error("Failed to load data:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        user_id: formData.user_id,
        apartment_id: formData.apartment_id,
        move_in_date: formData.move_in_date,
        lease_start_date: formData.lease_start_date,
        lease_end_date: formData.lease_end_date,
        deposit_amount: Number.parseFloat(formData.deposit_amount),
        monthly_rent: Number.parseFloat(formData.monthly_rent),
        status: formData.status,
      }
      
      const result = await createResident(data)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Phân công cư dân thành công")
        setOpen(false)
        setFormData({
          user_id: "",
          apartment_id: "",
          move_in_date: "",
          lease_start_date: "",
          lease_end_date: "",
          deposit_amount: "",
          monthly_rent: "",
          status: "active",
        })
        if (onSuccess) onSuccess() // Refresh data
      }
    } catch (error) {
      console.error("Failed to create resident:", error)
      toast.error("Không thể phân công cư dân. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Phân công cư dân vào căn hộ</DialogTitle>
          <DialogDescription>Tạo phân công cư dân mới với thông tin hợp đồng thuê</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user_id">Chọn cư dân *</Label>
                <Select value={formData.user_id} onValueChange={(value) => setFormData({ ...formData, user_id: value })} required>
                  <SelectTrigger><SelectValue placeholder="Chọn cư dân" /></SelectTrigger>
                  <SelectContent>
                    {users.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        Không có cư dân nào chưa được phân công
                      </div>
                    ) : (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.fullName || user.full_name} ({user.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="apartment_id">Chọn căn hộ *</Label>
                <Select value={formData.apartment_id} onValueChange={(value) => setFormData({ ...formData, apartment_id: value })} required>
                  <SelectTrigger><SelectValue placeholder="Chọn căn hộ" /></SelectTrigger>
                  <SelectContent>
                    {apartments.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        Không có căn hộ nào còn trống
                      </div>
                    ) : (
                      apartments.map((apt) => (
                        <SelectItem key={apt.id} value={apt.id}>
                          {apt.apartmentNumber} - Tầng {apt.floor}{apt.building ? ` - ${apt.building}` : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="move_in_date">Ngày chuyển vào *</Label>
                <Input id="move_in_date" type="date" value={formData.move_in_date} onChange={(e) => setFormData({ ...formData, move_in_date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái *</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                    <SelectItem value="terminated">Đã chấm dứt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lease_start_date">Ngày bắt đầu hợp đồng *</Label>
                <Input id="lease_start_date" type="date" value={formData.lease_start_date} onChange={(e) => setFormData({ ...formData, lease_start_date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lease_end_date">Ngày kết thúc hợp đồng *</Label>
                <Input id="lease_end_date" type="date" value={formData.lease_end_date} onChange={(e) => setFormData({ ...formData, lease_end_date: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deposit_amount">Tiền cọc (VNĐ) *</Label>
                <Input id="deposit_amount" type="number" step="1000" placeholder="VD: 10000000" value={formData.deposit_amount} onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly_rent">Tiền thuê hàng tháng (VNĐ) *</Label>
                <Input id="monthly_rent" type="number" step="1000" placeholder="VD: 15000000" value={formData.monthly_rent} onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })} required />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
            <Button 
              type="submit" 
              disabled={loading || users.length === 0 || apartments.length === 0}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Phân công cư dân
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

