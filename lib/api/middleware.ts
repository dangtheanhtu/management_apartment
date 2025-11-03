import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { createErrorResponse } from './error-handler'

export type APIHandler = (
  request: NextRequest,
  context?: any
) => Promise<NextResponse>

export type AuthenticatedHandler = (
  request: NextRequest,
  user: any,
  context?: any
) => Promise<NextResponse>

/**
 * Middleware để bảo vệ API routes yêu cầu authentication
 */
export function withAuth(handler: AuthenticatedHandler): APIHandler {
  return async (request: NextRequest, context?: any) => {
    try {
      const session = await getServerSession(authOptions)
      
      if (!session?.user) {
        return createErrorResponse('Vui lòng đăng nhập', 401)
      }

      return handler(request, session.user, context)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return createErrorResponse('Lỗi xác thực', 500)
    }
  }
}

/**
 * Middleware để bảo vệ API routes yêu cầu specific roles
 */
export function withRole(allowedRoles: string[], handler: AuthenticatedHandler): APIHandler {
  return withAuth(async (request: NextRequest, user: any, context?: any) => {
    if (!allowedRoles.includes(user.role)) {
      return createErrorResponse('Bạn không có quyền truy cập', 403)
    }

    return handler(request, user, context)
  })
}

/**
 * Middleware cho admin-only routes
 */
export function withAdmin(handler: AuthenticatedHandler): APIHandler {
  return withRole(['admin'], handler)
}

/**
 * Middleware cho resident routes
 */
export function withResident(handler: AuthenticatedHandler): APIHandler {
  return withRole(['resident', 'admin'], handler)
}
