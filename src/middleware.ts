import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = ["/", "/set-password"];

// Define protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/admins",
  "/communities",
  "/users",
  "/collections",
  "/utilities",
  "/wallet",
  "/access-codes",
  "/audit-logs",
  "/partners",
  "/integrations",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the route is public
  const isPublicRoute = publicRoutes.includes(pathname);

  // Get token from cookies or you can check headers if stored differently
  // Note: Since we're using localStorage for token storage, this middleware
  // primarily serves as a URL guard. The actual authentication check happens
  // client-side in the dashboard layout.

  // For now, we'll let the client-side guards handle authentication
  // This middleware can be extended later for server-side checks if needed

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)",
  ],
};
