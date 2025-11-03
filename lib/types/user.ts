export type UserRole = "admin" | "staff" | "resident"
export type UserStatus = "active" | "inactive"

export interface User {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: UserRole
  status: UserStatus
  created_at: string
  updated_at: string
  avatar_url?: string | null
}

export interface CurrentUser {
  id: string
  email: string
  fullName: string
  phone: string | null
  role: UserRole
  status: UserStatus
  avatarUrl?: string | null
}

export interface UserPreferences {
  id: string
  user_id: string
  email_notifications: boolean
  sms_notifications: boolean
  push_notifications: boolean
  maintenance_alerts: boolean
  payment_reminders: boolean
  community_updates: boolean
  theme: "light" | "dark" | "system"
  language: string
  created_at: string
  updated_at: string
}

export type AmenityCategory = "facility" | "service" | "recreation" | "security" | "utility"
export type AmenityStatus = "active" | "inactive" | "maintenance"

export interface Amenity {
  id: string
  name: string
  description: string | null
  category: AmenityCategory
  location: string | null
  operating_hours: string | null
  contact_info: string | null
  icon: string | null
  status: AmenityStatus
  created_at: string
  updated_at: string
}

export interface AmenityImage {
  id: string
  url: string
  alt_text?: string | null
  amenity_id: string
  created_at: string
  updated_at: string
}

export interface AmenityDetail extends Amenity {
  images: AmenityImage[]
}
