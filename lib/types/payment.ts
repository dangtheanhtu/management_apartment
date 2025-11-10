export type InvoiceType = 'RENT' | 'ELECTRICITY' | 'WATER' | 'INTERNET' | 'SERVICE' | 'REPAIR' | 'rent' | 'utilities' | 'maintenance' | 'parking' | 'other'
export type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'pending' | 'paid' | 'overdue' | 'cancelled'
export type PaymentGateway = 'VNPAY' | 'MOMO' | 'BANK_TRANSFER'
export type TransactionStatus = 'SUCCESS' | 'FAILED' | 'PENDING'

export interface Invoice {
  id: string
  user_id: string
  apartment_id: string
  type: InvoiceType
  amount: number
  issue_date: string
  due_date: string
  status: InvoiceStatus
  description?: string | null
  created_at: string
  updated_at: string
  // Populated fields from API
  user_name?: string
  user_email?: string
  apartment_number?: string
  building?: string
}

export interface Transaction {
  id: string
  invoice_id: string
  payment_gateway: PaymentGateway
  transaction_code: string
  amount_paid: number
  payment_date: string
  status: TransactionStatus
  gateway_response?: any
  created_at: string
  updated_at: string
}

export interface InvoiceDetail extends Invoice {
  apartment: {
    id: string
    apartment_number: string
    building?: string | null
    floor: number
  }
  user: {
    id: string
    full_name: string
    email: string
  }
  transactions: Transaction[]
}

export interface CreateInvoiceRequest {
  user_id: string
  apartment_id: string
  type: InvoiceType
  amount: number
  due_date: string
  description?: string
}

export interface PaymentUrlRequest {
  invoice_id: string
  payment_gateway: PaymentGateway
  return_url?: string
}

export interface PaymentUrlResponse {
  payment_url: string
  transaction_code: string
  expires_at: string
}

export interface PaymentCallbackData {
  transaction_code: string
  amount: number
  status: TransactionStatus
  gateway_response: any
}

export interface RevenueSummary {
  total_revenue: number
  rent_revenue: number
  utility_revenue: number
  service_revenue: number
  total_invoices: number
  paid_invoices: number
  pending_invoices: number
  overdue_invoices: number
}

export interface InvoiceStats {
  total_amount: number
  paid_amount: number
  pending_amount: number
  overdue_amount: number
  total_count: number
  paid_count: number
  pending_count: number
  overdue_count: number
}

// Helper functions for display
export function getInvoiceTypeDisplayName(type: string): string {
  const typeUpper = type?.toUpperCase()
  const typeNames: Record<string, string> = {
    'RENT': 'Tiền thuê',
    'ELECTRICITY': 'Tiền điện',
    'WATER': 'Tiền nước',
    'INTERNET': 'Tiền internet',
    'SERVICE': 'Phí dịch vụ',
    'REPAIR': 'Phí sửa chữa',
    'UTILITIES': 'Tiền điện/nước',
    'MAINTENANCE': 'Phí bảo trì',
    'PARKING': 'Phí gửi xe',
    'OTHER': 'Khác'
  }
  return typeNames[typeUpper] || type
}

export function getInvoiceStatusDisplayName(status: string): string {
  const statusUpper = status?.toUpperCase()
  const statusNames: Record<string, string> = {
    'PENDING': 'Chờ thanh toán',
    'PAID': 'Đã thanh toán',
    'OVERDUE': 'Quá hạn',
    'CANCELLED': 'Đã hủy'
  }
  return statusNames[statusUpper] || status
}

export function getPaymentGatewayDisplayName(gateway: PaymentGateway): string {
  const gatewayNames: Record<PaymentGateway, string> = {
    'VNPAY': 'VNPay',
    'MOMO': 'MoMo',
    'BANK_TRANSFER': 'Chuyển khoản ngân hàng'
  }
  return gatewayNames[gateway] || gateway
}

export function getTransactionStatusDisplayName(status: TransactionStatus): string {
  const statusNames: Record<TransactionStatus, string> = {
    'SUCCESS': 'Thành công',
    'FAILED': 'Thất bại',
    'PENDING': 'Đang xử lý'
  }
  return statusNames[status] || status
}
