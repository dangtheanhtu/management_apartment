"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Receipt, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  DollarSign,
  FileText,
  History
} from "lucide-react"
import type { Invoice, Transaction } from "@/lib/types/payment"
import { getInvoiceTypeDisplayName, getInvoiceStatusDisplayName, getPaymentGatewayDisplayName } from "@/lib/types/payment"

export default function ResidentInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [paymentGateway, setPaymentGateway] = useState<'VNPAY' | 'MOMO' | 'BANK_TRANSFER'>('VNPAY')
  const [processingPayment, setProcessingPayment] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [invoicesResponse, transactionsResponse] = await Promise.all([
        fetch('/api/me/invoices'),
        fetch('/api/me/transactions')
      ])

      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json()
        // Handle response structure - ensure it's an array
        setInvoices(Array.isArray(invoicesData) ? invoicesData : (invoicesData.invoices || []))
      }

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        // Handle response structure - ensure it's an array
        setTransactions(Array.isArray(transactionsData) ? transactionsData : (transactionsData.transactions || []))
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Không thể tải dữ liệu")
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (invoice: Invoice) => {
    setProcessingPayment(true)
    setError(null)

    try {
      const response = await fetch(`/api/invoices/${invoice.id}/create-payment-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_gateway: paymentGateway,
          return_url: `${window.location.origin}/resident/invoices`
        })
      })

      const result = await response.json()

      if (response.ok && result.payment_url) {
        // Redirect to payment gateway
        window.location.href = result.payment_url
      } else {
        setError(result.error || "Không thể tạo URL thanh toán")
      }
    } catch (error) {
      console.error("Payment error:", error)
      setError("Lỗi khi xử lý thanh toán")
    } finally {
      setProcessingPayment(false)
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
          <h1 className="text-3xl font-bold tracking-tight">Hóa đơn & Thanh toán</h1>
          <p className="text-muted-foreground">Quản lý hóa đơn và thanh toán của bạn</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hóa đơn & Thanh toán</h1>
        <p className="text-muted-foreground">Quản lý hóa đơn và thanh toán của bạn</p>
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

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Chờ thanh toán ({pendingInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="paid" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Đã thanh toán ({paidInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="overdue" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Quá hạn ({overdueInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Lịch sử giao dịch
          </TabsTrigger>
        </TabsList>

        {/* Pending Invoices */}
        <TabsContent value="pending" className="space-y-4">
          {pendingInvoices.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không có hóa đơn chờ thanh toán</h3>
                <p className="text-muted-foreground text-center">
                  Tất cả hóa đơn của bạn đã được thanh toán
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingInvoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(invoice.status)}
                        <div>
                          <CardTitle className="text-lg">
                            {getInvoiceTypeDisplayName(invoice.type)}
                          </CardTitle>
                          <CardDescription>
                            Hóa đơn #{invoice.id.slice(0, 8)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(invoice.status)}>
                        {getInvoiceStatusDisplayName(invoice.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Số tiền</p>
                          <p className="text-lg font-bold">{invoice.amount.toLocaleString()} VNĐ</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Hạn thanh toán</p>
                          <p className="text-sm">{new Date(invoice.due_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Ngày phát hành</p>
                          <p className="text-sm">{new Date(invoice.issue_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {invoice.description && (
                      <div>
                        <p className="text-sm font-medium mb-1">Mô tả</p>
                        <p className="text-sm text-muted-foreground">{invoice.description}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-4">
                      <Button 
                        onClick={() => handlePayment(invoice)}
                        disabled={processingPayment}
                        className="flex-1"
                      >
                        {processingPayment ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Thanh toán ngay
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Paid Invoices */}
        <TabsContent value="paid" className="space-y-4">
          {paidInvoices.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chưa có hóa đơn đã thanh toán</h3>
                <p className="text-muted-foreground text-center">
                  Các hóa đơn đã thanh toán sẽ hiển thị ở đây
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {paidInvoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(invoice.status)}
                        <div>
                          <CardTitle className="text-lg">
                            {getInvoiceTypeDisplayName(invoice.type)}
                          </CardTitle>
                          <CardDescription>
                            Hóa đơn #{invoice.id.slice(0, 8)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(invoice.status)}>
                        {getInvoiceStatusDisplayName(invoice.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Số tiền</p>
                          <p className="text-lg font-bold text-green-600">{invoice.amount.toLocaleString()} VNĐ</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Hạn thanh toán</p>
                          <p className="text-sm">{new Date(invoice.due_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Ngày phát hành</p>
                          <p className="text-sm">{new Date(invoice.issue_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {invoice.description && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-1">Mô tả</p>
                        <p className="text-sm text-muted-foreground">{invoice.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Overdue Invoices */}
        <TabsContent value="overdue" className="space-y-4">
          {overdueInvoices.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không có hóa đơn quá hạn</h3>
                <p className="text-muted-foreground text-center">
                  Tuyệt vời! Bạn đã thanh toán đúng hạn tất cả hóa đơn
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {overdueInvoices.map((invoice) => (
                <Card key={invoice.id} className="border-red-200 bg-red-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(invoice.status)}
                        <div>
                          <CardTitle className="text-lg text-red-800">
                            {getInvoiceTypeDisplayName(invoice.type)}
                          </CardTitle>
                          <CardDescription className="text-red-600">
                            Hóa đơn #{invoice.id.slice(0, 8)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(invoice.status)}>
                        {getInvoiceStatusDisplayName(invoice.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Số tiền</p>
                          <p className="text-lg font-bold text-red-600">{invoice.amount.toLocaleString()} VNĐ</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Hạn thanh toán</p>
                          <p className="text-sm text-red-600">{new Date(invoice.due_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Ngày phát hành</p>
                          <p className="text-sm">{new Date(invoice.issue_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {invoice.description && (
                      <div>
                        <p className="text-sm font-medium mb-1">Mô tả</p>
                        <p className="text-sm text-muted-foreground">{invoice.description}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-4">
                      <Button 
                        onClick={() => handlePayment(invoice)}
                        disabled={processingPayment}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        {processingPayment ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Thanh toán ngay
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Transaction History */}
        <TabsContent value="history" className="space-y-4">
          {transactions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <History className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chưa có giao dịch</h3>
                <p className="text-muted-foreground text-center">
                  Lịch sử giao dịch sẽ hiển thị ở đây
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.status === 'SUCCESS' ? 'bg-green-100' : 
                          transaction.status === 'FAILED' ? 'bg-red-100' : 'bg-yellow-100'
                        }`}>
                          <CreditCard className={`h-4 w-4 ${
                            transaction.status === 'SUCCESS' ? 'text-green-600' : 
                            transaction.status === 'FAILED' ? 'text-red-600' : 'text-yellow-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">
                            {getPaymentGatewayDisplayName(transaction.payment_gateway)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.transaction_code}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{transaction.amount_paid.toLocaleString()} VNĐ</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.payment_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Payment Gateway Selection Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chọn phương thức thanh toán</DialogTitle>
            <DialogDescription>
              Vui lòng chọn cổng thanh toán để tiếp tục
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Cổng thanh toán</label>
              <Select value={paymentGateway} onValueChange={(value: any) => setPaymentGateway(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VNPAY">VNPay</SelectItem>
                  <SelectItem value="MOMO">MoMo</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Chuyển khoản ngân hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedInvoice(null)}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button 
                onClick={() => selectedInvoice && handlePayment(selectedInvoice)}
                disabled={processingPayment}
                className="flex-1"
              >
                {processingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  'Tiếp tục'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
