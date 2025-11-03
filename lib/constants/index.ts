// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  RESIDENT: 'resident',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// User status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS]

// Apartment status
export const APARTMENT_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
} as const

export type ApartmentStatus = typeof APARTMENT_STATUS[keyof typeof APARTMENT_STATUS]

// Amenity status
export const AMENITY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

export type AmenityStatus = typeof AMENITY_STATUS[keyof typeof AMENITY_STATUS]

// Invoice status
export const INVOICE_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const

export type InvoiceStatus = typeof INVOICE_STATUS[keyof typeof INVOICE_STATUS]

// Service request status
export const SERVICE_REQUEST_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type ServiceRequestStatus = typeof SERVICE_REQUEST_STATUS[keyof typeof SERVICE_REQUEST_STATUS]

// Amenity types
export const AMENITY_TYPES = [
  'facility',
  'sports',
  'entertainment',
  'service',
  'other',
] as const

export type AmenityType = typeof AMENITY_TYPES[number]

// Payment methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  VNPAY: 'vnpay',
} as const

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS]

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const

// Status labels (Vietnamese)
export const STATUS_LABELS: Record<string, string> = {
  // User
  active: 'Hoạt động',
  inactive: 'Ngưng hoạt động',
  
  // Apartment
  available: 'Có sẵn',
  occupied: 'Đã thuê',
  maintenance: 'Bảo trì',
  
  // Invoice
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  overdue: 'Quá hạn',
  cancelled: 'Đã hủy',
  
  // Service Request
  in_progress: 'Đang xử lý',
  completed: 'Hoàn thành',
  
  // Roles
  admin: 'Quản trị viên',
  resident: 'Cư dân',
}

// Status colors for badges
export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  available: 'bg-green-100 text-green-800',
  occupied: 'bg-yellow-100 text-yellow-800',
  maintenance: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
}

// Navigation items
export const ADMIN_NAV_ITEMS = [
  { href: '/admin/apartments', label: 'Quản lý căn hộ', icon: 'Building' },
  { href: '/admin/residents', label: 'Quản lý cư dân', icon: 'Users' },
  { href: '/admin/amenities', label: 'Tiện ích', icon: 'Sparkles' },
  { href: '/admin/invoices', label: 'Hóa đơn', icon: 'Receipt' },
  { href: '/admin/maintenance', label: 'Yêu cầu bảo trì', icon: 'Wrench' },
  { href: '/admin/financial', label: 'Tài chính', icon: 'DollarSign' },
  { href: '/admin/users', label: 'Người dùng', icon: 'UserCog' },
  { href: '/admin/settings', label: 'Cài đặt', icon: 'Settings' },
] as const

export const RESIDENT_NAV_ITEMS = [
  { href: '/resident/apartment', label: 'Căn hộ của tôi', icon: 'Home' },
  { href: '/resident/invoices', label: 'Hóa đơn', icon: 'Receipt' },
  { href: '/resident/amenities', label: 'Tiện ích', icon: 'Sparkles' },
  { href: '/resident/maintenance', label: 'Yêu cầu bảo trì', icon: 'Wrench' },
  { href: '/resident/profile', label: 'Thông tin cá nhân', icon: 'User' },
  { href: '/resident/settings', label: 'Cài đặt', icon: 'Settings' },
] as const
