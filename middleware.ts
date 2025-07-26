import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { authenticateRequest } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't need authentication
  const publicRoutes = [
    "/",
    "/trainers",
    "/astrology", 
    "/ai-planner",
    "/api/auth/login",
    "/api/trainers/auth",
    "/api/upload"
  ]

  // Check if it's a public route
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    // Skip login page from protection
    if (pathname === "/admin/login") {
      return NextResponse.next()
    }

    try {
    const user = await authenticateRequest(request)
      if (!user || user.role !== "super_admin") {
        return NextResponse.redirect(new URL("/admin/login", request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  // Trainer routes protection
  if (pathname.startsWith("/trainer")) {
    // Skip login page from protection
    if (pathname === "/trainer/login") {
      return NextResponse.next()
    }

    // For trainer routes, check if they have a valid JWT token
    const token = request.cookies.get("trainer-token")?.value || 
                  request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
        return NextResponse.redirect(new URL("/trainer/login", request.url))
    }
  }

  // API routes protection - only protect specific admin APIs
  const protectedAdminApiRoutes = [
    "/api/admin/stats",
    "/api/admin/notifications"
  ]

  if (protectedAdminApiRoutes.some(route => pathname.startsWith(route))) {
    try {
      const user = await authenticateRequest(request)
      if (!user || user.role !== "super_admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    } catch (error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  // Allow all other API routes to pass through
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/trainer/:path*",
    "/api/admin/:path*",
    "/api/trainers/:path*",
    "/api/users/:path*",
    "/api/wellness-plans/:path*",
  ],
}
