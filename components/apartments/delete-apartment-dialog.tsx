"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteApartment, type Apartment } from "@/lib/apartments/actions"
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

interface DeleteApartmentDialogProps {
  apartment: Apartment
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteApartmentDialog({ apartment, open, onOpenChange }: DeleteApartmentDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)

    try {
      await deleteApartment(apartment.id)
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error deleting apartment:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Apartment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete apartment <strong>{apartment.apartment_number}</strong>? This action cannot
            be undone and will also remove all associated resident records.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-red-600 hover:bg-red-700">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
