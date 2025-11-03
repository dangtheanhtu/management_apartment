import { z } from 'zod'

// Common validation schemas
export const emailSchema = z.string().email('Email không hợp lệ')

export const phoneSchema = z
  .string()
  .regex(/^[0-9]{10}$/, 'Số điện thoại phải có 10 chữ số')
  .optional()
  .or(z.literal(''))

export const passwordSchema = z
  .string()
  .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')

export const requiredString = (fieldName: string) =>
  z.string().min(1, `${fieldName} không được để trống`)

export const positiveNumber = (fieldName: string) =>
  z.number().positive(`${fieldName} phải là số dương`)

export const nonNegativeNumber = (fieldName: string) =>
  z.number().min(0, `${fieldName} không được âm`)

// Apartment validation schema
export const apartmentSchema = z.object({
  apartmentNumber: requiredString('Mã căn hộ'),
  floor: positiveNumber('Tầng'),
  building: requiredString('Tòa nhà'),
  bedrooms: nonNegativeNumber('Số phòng ngủ'),
  bathrooms: nonNegativeNumber('Số phòng tắm'),
  area: positiveNumber('Diện tích'),
  rentPrice: nonNegativeNumber('Giá thuê'),
  status: z.enum(['available', 'occupied', 'maintenance']),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
})

export type ApartmentFormData = z.infer<typeof apartmentSchema>

// Amenity validation schema
export const amenitySchema = z.object({
  name: requiredString('Tên tiện ích'),
  type: requiredString('Loại tiện ích'),
  description: z.string().optional(),
  location: z.string().optional(),
  operatingHours: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  imageUrl: z.string().optional(),
})

export type AmenityFormData = z.infer<typeof amenitySchema>

// User validation schema
export const userSchema = z.object({
  email: emailSchema,
  fullName: requiredString('Họ và tên'),
  phone: phoneSchema,
  role: z.enum(['admin', 'resident']),
  status: z.enum(['active', 'inactive']),
  password: passwordSchema.optional(),
})

export type UserFormData = z.infer<typeof userSchema>

// Invoice validation schema
export const invoiceSchema = z.object({
  apartmentId: requiredString('Căn hộ'),
  month: z.number().min(1).max(12),
  year: z.number().min(2020),
  electricityUsage: nonNegativeNumber('Điện tiêu thụ'),
  waterUsage: nonNegativeNumber('Nước tiêu thụ'),
  rentAmount: nonNegativeNumber('Tiền thuê'),
  electricityAmount: nonNegativeNumber('Tiền điện'),
  waterAmount: nonNegativeNumber('Tiền nước'),
  serviceAmount: nonNegativeNumber('Phí dịch vụ'),
  otherAmount: nonNegativeNumber('Chi phí khác').optional(),
  notes: z.string().optional(),
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>

// Helper function to validate data
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    return { success: false, error: 'Dữ liệu không hợp lệ' }
  }
}
