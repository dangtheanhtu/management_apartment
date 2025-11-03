"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Receipt, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  DollarSign,
  FileText,
  Users,
  Building
} from "lucide-react"
import type { Invoice, CreateInvoiceRequest } from "@/lib/types/payment"
import { getInvoiceTypeDisplayName, getInvoiceStatusDisplayName } from "@/lib/types/payment"

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [apartments, setApartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<CreateInvoiceRequest>({
    user_id: '',
    apartment_id: '',
    type: 'RENT',
    amount: 0,
    due_date: '',
    description: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [invoicesResponse, usersResponse, apartmentsResponse] = await Promise.all([
        fetch('/api/admin/invoices'),
        fetch('/api/admin/users'),
        fetch('/api/admin/apartments')
      ])

      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json()
        // Handle response structure: { success, invoices, pagination }
        setInvoices(Array.isArray(invoicesData) ? invoicesData : (invoicesData.invoices || []))
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        console.log('Users data:', usersData)
        console.log('Resident users:', Array.isArray(usersData) ? usersData.filter((u: any) => u.role === 'resident') : [])
        setUsers(Array.isArray(usersData) ? usersData : [])
      }

      if (apartmentsResponse.ok) {
        const apartmentsData = await apartmentsResponse.json()
        setApartments(Array.isArray(apartmentsData) ? apartmentsData : (apartmentsData.data || []))
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Không thể tải dữ liệu")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess("Tạo hóa đơn thành công")
        setCreateDialogOpen(false)
        setFormData({
          user_id: '',
          apartment_id: '',
          type: 'RENT',
          amount: 0,
          due_date: '',
          description: ''
        })
        fetchData() // Refresh data
      } else {
        setError(result.error || "Không thể tạo hóa đơn")
      }
    } catch (error) {
      console.error("Create invoice error:", error)
      setError("Lỗi khi tạo hóa đơn")
    } finally {
      setCreating(false)
    }
  }

  const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase()
    switch (statusLower) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    const statusLower = status?.toLowerCase()
    switch (statusLower) {
      case 'pending':
        return "secondary"
      case 'paid':
        return "default"
      case 'overdue':
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user ? user.full_name : 'Unknown User'
  }

  const getApartmentNumber = (apartmentId: string) => {
    const apartment = apartments.find(a => a.id === apartmentId)
    return apartment ? apartment.apartment_number : 'Unknown Apartment'
  }

  const pendingInvoices = invoices.filter(inv => inv.status?.toLowerCase() === 'pending')
  const paidInvoices = invoices.filter(inv => inv.status?.toLowerCase() === 'paid')
  const overdueInvoices = invoices.filter(inv => inv.status?.toLowerCase() === 'overdue')

  const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Hóa đơn</h1>
          <p className="text-muted-foreground">Quản lý tất cả hóa đơn trong hệ thống</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Hóa đơn</h1>
          <p className="text-muted-foreground">Quản lý tất cả hóa đơn trong hệ thống</p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo hóa đơn mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tạo hóa đơn mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin để tạo hóa đơn cho cư dân
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user_id">Cư dân *</Label>
                  <Select 
                    value={formData.user_id} 
                    onValueChange={(value) => {
                      // Find selected user's apartment
                      const selectedUser = users.find(u => u.id === value)
                      const userApartmentId = selectedUser?.apartment_id || ''
                      
                      setFormData({
                        ...formData, 
                        user_id: value,
                        apartment_id: userApartmentId
                      })
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn cư dân">
                        {formData.user_id && (() => {
                          const selectedUser = users.find(u => u.id === formData.user_id)
                          return selectedUser ? (
                            <span className="truncate block">
                              {selectedUser.full_name}
                            </span>
                          ) : 'Chọn cư dân'
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {users.filter(u => u.role === 'resident').map((user) => (
                        <SelectItem key={user.id} value={user.id} className="cursor-pointer">
                          <div className="flex flex-col w-full pr-4">
                            <span className="font-medium truncate">{user.full_name}</span>
                            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apartment_id">Căn hộ *</Label>
                  <Select value={formData.apartment_id} onValueChange={(value) => setFormData({...formData, apartment_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn căn hộ" />
                    </SelectTrigger>
                    <SelectContent>
                      {apartments.map((apartment) => (
                        <SelectItem key={apartment.id} value={apartment.id}>
                          {apartment.apartment_number} - Tầng {apartment.floor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Loại hóa đơn *</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RENT">Tiền thuê</SelectItem>
                      <SelectItem value="ELECTRICITY">Tiền điện</SelectItem>
                      <SelectItem value="WATER">Tiền nước</SelectItem>
                      <SelectItem value="INTERNET">Tiền internet</SelectItem>
                      <SelectItem value="SERVICE">Phí dịch vụ</SelectItem>
                      <SelectItem value="REPAIR">Phí sửa chữa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Số tiền (VNĐ) *</Label>
                  <Input
                    id="amount"
                    type="text"
                    value={formData.amount > 0 ? formData.amount.toLocaleString('vi-VN') : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '')
                      setFormData({...formData, amount: parseInt(value) || 0})
                    }}
                    placeholder="Nhập số tiền"
                    required
                    className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Hạn thanh toán *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Nhập mô tả chi tiết..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  disabled={creating}
                  className="flex-1"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang tạo...
                    </>
                  ) : (
                    'Tạo hóa đơn'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ thanh toán</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              {totalPending.toLocaleString()} VNĐ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã thanh toán</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              {totalPaid.toLocaleString()} VNĐ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quá hạn</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              {totalOverdue.toLocaleString()} VNĐ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Tất cả hóa đơn</CardTitle>
          <CardDescription>
            {invoices.length} hóa đơn trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có hóa đơn</h3>
              <p className="text-muted-foreground text-center">
                Tạo hóa đơn đầu tiên để bắt đầu quản lý
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(invoice.status)}
                        <div>
                          <p className="font-medium">
                            {getInvoiceTypeDisplayName(invoice.type)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {getUserName(invoice.user_id)} - {getApartmentNumber(invoice.apartment_id)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold">{invoice.amount.toLocaleString()} VNĐ</p>
                          <p className="text-sm text-muted-foreground">
                            Hạn: {new Date(invoice.due_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(invoice.status)}>
                          {getInvoiceStatusDisplayName(invoice.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    {invoice.description && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground">{invoice.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
