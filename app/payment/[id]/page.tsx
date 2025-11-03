"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CreditCard, 
  QrCode, 
  Building2, 
  CheckCircle, 
  Clock,
  ArrowLeft,
  Smartphone
} from "lucide-react"
import Image from "next/image"

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const invoiceId = params.id as string
  const amount = searchParams.get('amount')
  const gateway = searchParams.get('gateway') || 'VNPAY'
  const returnUrl = searchParams.get('returnUrl')

  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedGateway, setSelectedGateway] = useState(gateway)
  const [qrCode, setQrCode] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoice()
  }, [invoiceId])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`)
      if (response.ok) {
        const data = await response.json()
        setInvoice(data)
      } else {
        setError("Không tìm thấy hóa đơn")
      }
    } catch (error) {
      console.error("Error fetching invoice:", error)
      setError("Lỗi khi tải thông tin hóa đơn")
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = async () => {
    try {
      setProcessing(true)
      // Mock QR code generation - trong thực tế sẽ call API VNPay/MoMo
      const qrData = {
        gateway: selectedGateway,
        amount: invoice?.amount || amount,
        invoiceId: invoiceId,
        timestamp: Date.now()
      }
      
      // Giả lập QR code URL
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(JSON.stringify(qrData))}`
      setQrCode(qrUrl)
    } catch (error) {
      console.error("Error generating QR code:", error)
      setError("Lỗi khi tạo mã QR")
    } finally {
      setProcessing(false)
    }
  }

  const handleConfirmPayment = async () => {
    setProcessing(true)
    setError(null)

    try {
      // Mock payment confirmation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Trong thực tế sẽ call API để xác nhận thanh toán
      const response = await fetch(`/api/invoices/${invoiceId}/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_gateway: selectedGateway,
          transaction_code: `TXN-${Date.now()}`
        })
      })

      if (response.ok) {
        // Redirect về trang invoices
        router.push(returnUrl || '/resident/invoices?payment=success')
      } else {
        setError("Không thể xác nhận thanh toán. Vui lòng thử lại.")
      }
    } catch (error) {
      console.error("Payment error:", error)
      setError("Lỗi khi xử lý thanh toán")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(returnUrl || '/resident/invoices')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Thanh toán hóa đơn</h1>
          <p className="text-muted-foreground">Chọn phương thức thanh toán phù hợp</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-5 gap-6">
        {/* Invoice Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin hóa đơn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Mã hóa đơn</p>
              <p className="font-medium">#{invoiceId.slice(0, 8)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Số tiền</p>
              <p className="text-2xl font-bold text-primary">
                {(invoice?.amount || amount || 0).toLocaleString()} VNĐ
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trạng thái</p>
              <Badge variant="secondary">Chờ thanh toán</Badge>
            </div>
            {invoice?.description && (
              <div>
                <p className="text-sm text-muted-foreground">Mô tả</p>
                <p className="text-sm">{invoice.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Phương thức thanh toán</CardTitle>
            <CardDescription>Chọn cổng thanh toán để tiếp tục</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedGateway} onValueChange={setSelectedGateway}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="VNPAY" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  VNPay
                </TabsTrigger>
                <TabsTrigger value="MOMO" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  MoMo
                </TabsTrigger>
              </TabsList>

              <TabsContent value="VNPAY" className="space-y-4 mt-4">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Thanh toán qua VNPay</h3>
                    <p className="text-sm text-muted-foreground">
                      Quét mã QR bằng ứng dụng VNPay hoặc Internet Banking
                    </p>
                  </div>

                  {!qrCode ? (
                    <Button 
                      onClick={generateQRCode}
                      disabled={processing}
                      className="w-full"
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Đang tạo mã QR...
                        </>
                      ) : (
                        <>
                          <QrCode className="h-4 w-4 mr-2" />
                          Tạo mã QR thanh toán
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="p-4 bg-white rounded-lg border">
                          <Image 
                            src={qrCode} 
                            alt="QR Code" 
                            width={300} 
                            height={300}
                            className="rounded"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Quét mã QR bằng ứng dụng VNPay để thanh toán
                      </p>
                      <Button 
                        onClick={handleConfirmPayment}
                        disabled={processing}
                        className="w-full"
                      >
                        {processing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Tôi đã thanh toán
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="MOMO" className="space-y-4 mt-4">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center">
                      <Smartphone className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Thanh toán qua MoMo</h3>
                    <p className="text-sm text-muted-foreground">
                      Quét mã QR bằng ứng dụng MoMo để thanh toán nhanh chóng
                    </p>
                  </div>

                  {!qrCode ? (
                    <Button 
                      onClick={generateQRCode}
                      disabled={processing}
                      className="w-full bg-pink-600 hover:bg-pink-700"
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Đang tạo mã QR...
                        </>
                      ) : (
                        <>
                          <QrCode className="h-4 w-4 mr-2" />
                          Tạo mã QR thanh toán
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="p-4 bg-white rounded-lg border">
                          <Image 
                            src={qrCode} 
                            alt="QR Code" 
                            width={300} 
                            height={300}
                            className="rounded"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Mở ứng dụng MoMo và quét mã QR để thanh toán
                      </p>
                      <Button 
                        onClick={handleConfirmPayment}
                        disabled={processing}
                        className="w-full bg-pink-600 hover:bg-pink-700"
                      >
                        {processing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Tôi đã thanh toán
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Security Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-foreground mb-1">Giao dịch an toàn & bảo mật</p>
              <p>
                Thông tin thanh toán của bạn được mã hóa và bảo vệ theo tiêu chuẩn quốc tế. 
                Chúng tôi không lưu trữ thông tin thẻ của bạn.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
