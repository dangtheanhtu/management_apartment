"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteResident, type Resident } from "@/lib/residents/actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface DeleteResidentDialogProps {
  resident: Resident
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteResidentDialog({ resident, open, onOpenChange, onSuccess }: DeleteResidentDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const result = await deleteResident(resident.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Xóa cư dân thành công")
        onOpenChange(false)
        if (onSuccess) onSuccess() // Refresh data
      }
    } catch (error) {
      console.error("Failed to delete resident:", error)
      toast.error("Xóa thất bại, vui lòng thử lại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent style={{ borderRadius: "8px" }}>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa cư dân</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa cư dân <strong>{resident.fullName}</strong>
            {resident.apartment && ` khỏi căn hộ ${resident.apartment.apartmentNumber}`}?
            <br />Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} style={{ borderRadius: "8px" }}>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading} style={{ borderRadius: "8px" }}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
