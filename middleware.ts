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
    "/api/auth/login",
    "/api/trainers/auth",
    "/api/upload",
    "/api/generate-plan"
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
      console.error("Admin authentication error:", error)
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  // AI Planner protection - only accessible by super admin
  if (pathname.startsWith("/ai-planner")) {
    try {
      const user = await authenticateRequest(request)
      if (!user || user.role !== "super_admin") {
        return NextResponse.redirect(new URL("/admin/login", request.url))
      }
    } catch (error) {
      console.error("AI Planner authentication error:", error)
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  // Trainer routes protection
  if (pathname.startsWith("/trainer")) {
    // Skip login page from protection
    if (pathname === "/trainer/login") {
      return NextResponse.next()
    }

    try {
      const user = await authenticateRequest(request)
      console.log('Middleware - trainer auth check:', user);
      if (!user || user.role !== "trainer") {
        console.log('Middleware - trainer not authenticated, redirecting');
        return NextResponse.redirect(new URL("/trainer/login", request.url))
      }
      console.log('Middleware - trainer authenticated successfully');
    } catch (error) {
      console.error("Trainer authentication error:", error)
      return NextResponse.redirect(new URL("/trainer/login", request.url))
    }
  }

  // API routes protection
  const protectedAdminApiRoutes = [
    "/api/admin/stats",
    "/api/admin/notifications",
    "/api/admin/members",
    "/api/admin/trainers",
    "/api/admin/add-trainer"
  ]

  if (protectedAdminApiRoutes.some(route => pathname.startsWith(route))) {
    try {
      const user = await authenticateRequest(request)
      if (!user || user.role !== "super_admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    } catch (error) {
      console.error("Admin API authentication error:", error)
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
    "/ai-planner",
    "/api/admin/:path*",
    "/api/trainers/:path*",
    "/api/users/:path*",
    "/api/wellness-plans/:path*",
  ],
}
