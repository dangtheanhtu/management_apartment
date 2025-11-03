"use client"

import { useState } from "react"
import type { Resident } from "@/lib/residents/actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Pencil, Trash2 } from "lucide-react"
import { EditResidentDialog } from "./edit-resident-dialog"
import { DeleteResidentDialog } from "./delete-resident-dialog"

interface ResidentTableProps {
  residents: Resident[]
  onUpdate: () => void
  loading?: boolean
}

export function ResidentTable({ residents, onUpdate, loading = false }: ResidentTableProps) {
  const [editingResident, setEditingResident] = useState<Resident | null>(null)
  const [deletingResident, setDeletingResident] = useState<Resident | null>(null)

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "Chưa cập nhật"
    return new Date(date).toLocaleDateString("vi-VN")
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount || isNaN(amount)) return "Chưa cập nhật"
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string, className: string }> = {
      active: { variant: "default", label: "Hoạt động", className: "bg-green-500 hover:bg-green-600 text-white" },
      inactive: { variant: "secondary", label: "Không hoạt động", className: "bg-gray-400 hover:bg-gray-500 text-white" },
      terminated: { variant: "destructive", label: "Đã chấm dứt", className: "" },
    }
    const config = statusConfig[status] || statusConfig.inactive
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>
  }

  return (
    <TooltipProvider>
      <div className="rounded-lg border" style={{ borderRadius: "8px" }}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Cư dân</TableHead>
              <TableHead>Căn hộ</TableHead>
              <TableHead>Ngày chuyển vào</TableHead>
              <TableHead>Thời gian thuê</TableHead>
              <TableHead>Tiền thuê hàng tháng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-28 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-6 w-20 bg-muted animate-pulse rounded-full" /></TableCell>
                  <TableCell><div className="flex justify-end gap-2">
                    <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                  </div></TableCell>
                </TableRow>
              ))
            ) : residents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Chưa có cư dân nào. Phân công cư dân vào căn hộ để bắt đầu.
                </TableCell>
              </TableRow>
            ) : (
              residents.map((resident) => (
                <TableRow key={resident.id} style={{ lineHeight: "1.6" }}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{resident.fullName || "Chưa cập nhật"}</div>
                      <div className="text-sm text-muted-foreground">{resident.email}</div>
                      {resident.phone && (
                        <div className="text-xs text-muted-foreground mt-1">{resident.phone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {resident.apartment ? (
                      <div>
                        <div className="font-medium">{resident.apartment.apartmentNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {resident.apartment.building && `${resident.apartment.building}, `}
                          Tầng {resident.apartment.floor}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Chưa phân công</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(resident.move_in_date)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(resident.lease_start_date)}</div>
                      {resident.lease_end_date && (
                        <div className="text-muted-foreground">đến {formatDate(resident.lease_end_date)}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(resident.monthly_rent)}</TableCell>
                  <TableCell>{getStatusBadge(resident.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setEditingResident(resident)}
                            className="rounded-lg"
                            style={{ borderRadius: "8px" }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Chỉnh sửa</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setDeletingResident(resident)}
                            className="rounded-lg"
                            style={{ borderRadius: "8px" }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Xóa</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingResident && (
        <EditResidentDialog
          resident={editingResident}
          open={!!editingResident}
          onOpenChange={(open) => !open && setEditingResident(null)}
          onSuccess={onUpdate}
        />
      )}

      {deletingResident && (
        <DeleteResidentDialog
          resident={deletingResident}
          open={!!deletingResident}
          onOpenChange={(open) => !open && setDeletingResident(null)}
          onSuccess={onUpdate}
        />
      )}
    </TooltipProvider>
  )
}
