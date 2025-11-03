"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, Loader2 } from "lucide-react"
import { deleteAmenity } from "@/lib/amenities/actions"
import { toast } from "sonner"

interface DeleteAmenityDialogProps {
  amenityId: string
  amenityName: string
  onSuccess?: () => void
}

export function DeleteAmenityDialog({ amenityId, amenityName, onSuccess }: DeleteAmenityDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleDelete() {
    setIsLoading(true)

    const result = await deleteAmenity(amenityId)

    setIsLoading(false)

    if (result.success) {
      toast.success("Xóa tiện ích thành công")
      setOpen(false)
      if (onSuccess) {
        onSuccess()
      }
    } else {
      toast.error(result.error || "Có lỗi xảy ra khi xóa tiện ích")
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1 text-destructive hover:bg-destructive/10 bg-transparent">
          <Trash2 className="mr-2 h-4 w-4" />
          Xóa
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này sẽ xóa vĩnh viễn tiện ích <span className="font-semibold">{amenityName}</span>. Bạn không thể hoàn tác sau khi xóa.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
