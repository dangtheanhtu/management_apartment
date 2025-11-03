"use client"

import { useState } from "react"
import type { Apartment } from "@/lib/apartments/actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Image as ImageIcon } from "lucide-react"
import { EditApartmentDialog } from "./edit-apartment-dialog"
import { DeleteApartmentDialog } from "./delete-apartment-dialog"

interface ApartmentTableProps {
  apartments: Apartment[]
}

export function ApartmentTable({ apartments }: ApartmentTableProps) {
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null)
  const [deletingApartment, setDeletingApartment] = useState<Apartment | null>(null)

  const getStatusBadge = (status: string) => {
    const statusLabels: Record<string, string> = {
      available: "Có sẵn",
      occupied: "Đã thuê",
      maintenance: "Bảo trì",
    }
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      available: "default",
      occupied: "secondary",
      maintenance: "destructive",
    }
    return <Badge variant={variants[status] || "default"}>{statusLabels[status] || status}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ảnh</TableHead>
            <TableHead>Số căn hộ</TableHead>
            <TableHead>Tòa nhà</TableHead>
            <TableHead>Tầng</TableHead>
            <TableHead>Phòng ngủ</TableHead>
            <TableHead>Phòng tắm</TableHead>
            <TableHead>Diện tích (m²)</TableHead>
            <TableHead>Tiền thuê</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apartments.map((apartment) => {
            console.log('Apartment:', apartment.apartmentNumber, 'images:', apartment.images)
            const firstImage = apartment.images && apartment.images.length > 0 ? apartment.images[0] : null
            return (
              <TableRow key={apartment.id}>
                <TableCell>
                  {firstImage ? (
                    <div className="relative">
                      <img 
                        src={firstImage} 
                        alt={apartment.apartmentNumber}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      />
                      {apartment.images.length > 1 && (
                        <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-tl rounded-br-lg">
                          +{apartment.images.length - 1}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{apartment.apartmentNumber}</TableCell>
                <TableCell>{apartment.building || "N/A"}</TableCell>
                <TableCell>{apartment.floor}</TableCell>
                <TableCell>{apartment.bedrooms}</TableCell>
                <TableCell>{apartment.bathrooms}</TableCell>
                <TableCell>{apartment.area}</TableCell>
                <TableCell>{formatCurrency(apartment.rentPrice)}</TableCell>
                <TableCell>{getStatusBadge(apartment.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingApartment(apartment)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeletingApartment(apartment)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {editingApartment && (
        <EditApartmentDialog
          apartment={editingApartment}
          open={!!editingApartment}
          onOpenChange={(open) => !open && setEditingApartment(null)}
        />
      )}

      {deletingApartment && (
        <DeleteApartmentDialog
          apartment={deletingApartment}
          open={!!deletingApartment}
          onOpenChange={(open) => !open && setDeletingApartment(null)}
        />
      )}
    </>
  )
}
