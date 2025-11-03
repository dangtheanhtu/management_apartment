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

/**
 * Truncate text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Generate random string
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Check if string is valid URL
 */
export function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Get month name in Vietnamese
 */
export function getMonthName(month: number): string {
  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ]
  return months[month - 1] || ''
}
