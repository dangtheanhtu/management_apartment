import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Protected routes
    const protectedPaths = ["/dashboard", "/admin", "/resident", "/staff"]
    const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

    // Redirect to login if accessing protected route without authentication
    if (isProtectedPath && !token) {
      const url = req.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("callbackUrl", pathname)
      console.log(`[Middleware] Redirecting to login: ${pathname}`)
      return NextResponse.redirect(url)
    }

    // Redirect to dashboard if already logged in and trying to access auth pages
    if ((pathname === "/login" || pathname === "/register") && token) {
      const url = req.nextUrl.clone()
      url.pathname = "/dashboard"
      console.log(`[Middleware] Already logged in, redirecting to dashboard`)
      return NextResponse.redirect(url)
    }

    // Role-based access control
    if (token) {
      const userRole = token.role as string
      
      // Admin routes - only admins and staff can access
      if (pathname.startsWith("/admin") && userRole !== "admin" && userRole !== "staff") {
        const url = req.nextUrl.clone()
        url.pathname = "/dashboard"
        console.log(`[Middleware] Access denied to admin route for role: ${userRole}`)
        return NextResponse.redirect(url)
      }
      
      // Staff routes - only staff can access
      if (pathname.startsWith("/staff") && userRole !== "staff") {
        const url = req.nextUrl.clone()
        url.pathname = "/dashboard"
        console.log(`[Middleware] Access denied to staff route for role: ${userRole}`)
        return NextResponse.redirect(url)
      }
      
      // Resident routes - residents, staff, and admin can access
      if (pathname.startsWith("/resident") && userRole !== "resident" && userRole !== "staff" && userRole !== "admin") {
        const url = req.nextUrl.clone()
        url.pathname = "/dashboard"
        console.log(`[Middleware] Access denied to resident route for role: ${userRole}`)
        return NextResponse.redirect(url)
      }

      // Dashboard routing based on role
      // Keep users on dashboard page instead of redirecting
      // Removed automatic redirects - users can navigate from dashboard
      /*
      if (pathname === "/dashboard" && token) {
        const url = req.nextUrl.clone()
        
        // Redirect based on role if on base dashboard
        if (userRole === "admin") {
          url.pathname = "/admin/apartments"
        } else if (userRole === "staff") {
          url.pathname = "/staff/maintenance"
        } else if (userRole === "resident") {
          url.pathname = "/resident/apartment"
        }
        
        // Only redirect if pathname changed
        if (url.pathname !== pathname) {
          console.log(`[Middleware] Redirecting to role-specific dashboard: ${url.pathname}`)
          return NextResponse.redirect(url)
        }
      }
      */
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow access to public routes
        const publicPaths = ["/", "/login", "/register", "/community", "/search"]
        if (publicPaths.includes(pathname) || pathname.startsWith("/api/auth")) {
          return true
        }
        
        // Require authentication for protected routes
        const protectedPaths = ["/dashboard", "/admin", "/resident", "/staff"]
        const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))
        
        if (isProtectedPath) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}