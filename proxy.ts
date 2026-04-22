import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ROLES } from "@/lib/rbac"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Read the session role from cookies
  const userRole = request.cookies.get("user_role")?.value

  // 2. Protect the Admin Panel
  if (pathname.startsWith("/admin")) {
    // No cookie? Send to login.
    if (!userRole) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Normal user trying to snoop? Send to an unauthorized/403 page.
    if (
      userRole !== ROLES.SUPER_ADMIN &&
      userRole !== ROLES.MODERATOR &&
      userRole !== ROLES.CONTENT_CREATOR
    ) {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  // 3. Prevent authenticated admins from seeing the login screen
  if (pathname === "/login") {
    if (
      userRole === ROLES.SUPER_ADMIN ||
      userRole === ROLES.MODERATOR ||
      userRole === ROLES.CONTENT_CREATOR
    ) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
  }

  // 4. Let the request proceed normally
  return NextResponse.next()
}

// 5. Optimize performance: Only run this proxy on specific routes
export const config = {
  matcher: ["/admin/:path*", "/login"],
}
