import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { USER_ROLES } from '@/lib/constants'

export class AuthError extends Error {
  statusCode: number
  
  constructor(message: string, statusCode: number = 401) {
    super(message)
    this.name = 'AuthError'
    this.statusCode = statusCode
  }
}

/**
 * Get current authenticated user from session
 */
export async function getAuthUser() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    throw new AuthError('Vui lòng đăng nhập', 401)
  }
  
  return session.user
}

/**
 * Require authentication
 */
export async function requireAuth() {
  return getAuthUser()
}

/**
 * Require specific role
 */
export async function requireRole(allowedRoles: string[]) {
  const user = await getAuthUser()
  
  if (!allowedRoles.includes(user.role)) {
    throw new AuthError('Bạn không có quyền truy cập', 403)
  }
  
  return user
}

/**
 * Require admin role
 */
export async function requireAdmin() {
  return requireRole([USER_ROLES.ADMIN])
}

/**
 * Require resident role (or admin)
 */
export async function requireResident() {
  return requireRole([USER_ROLES.ADMIN, USER_ROLES.RESIDENT])
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getAuthUser()
    return user.role === USER_ROLES.ADMIN
  } catch {
    return false
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await getAuthUser()
    return true
  } catch {
    return false
  }
}

/**
 * Check if user owns a resource
 */
export async function checkResourceOwnership(resourceUserId: string): Promise<boolean> {
  try {
    const user = await getAuthUser()
    
    // Admin can access all resources
    if (user.role === USER_ROLES.ADMIN) {
      return true
    }
    
    // Check if user owns the resource
    return user.id === resourceUserId
  } catch {
    return false
  }
}
