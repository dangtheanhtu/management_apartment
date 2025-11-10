/**
 * Format currency to VND
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

/**
 * Format date to Vietnamese format
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(dateObj)
}

/**
 * Format datetime
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format area
 */
export function formatArea(area: number): string {
  return `${area} m²`
}

/**
 * Get status badge variant
 */
export function getStatusVariant(status: string): 'default' | 'success' | 'warning' | 'destructive' {
  const statusMap: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
    active: 'success',
    inactive: 'default',
    available: 'success',
    occupied: 'warning',
    maintenance: 'destructive',
    pending: 'warning',
    paid: 'success',
    overdue: 'destructive',
    completed: 'success',
    processing: 'warning',
    cancelled: 'destructive',
  }
  
  return statusMap[status] || 'default'
}

/**
 * Get status label in Vietnamese
 */
export function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    active: 'Hoạt động',
    inactive: 'Ngưng hoạt động',
    available: 'Có sẵn',
    occupied: 'Đã thuê',
    maintenance: 'Bảo trì',
    pending: 'Chờ xử lý',
    paid: 'Đã thanh toán',
    overdue: 'Quá hạn',
    completed: 'Hoàn thành',
    processing: 'Đang xử lý',
    cancelled: 'Đã hủy',
    admin: 'Quản trị viên',
    resident: 'Cư dân',
  }
  
  return statusLabels[status] || status
}


