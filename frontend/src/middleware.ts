import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const isLoginOrSignup = pathname === "/login" || pathname === "/signup";
  const isProtectedRoute = pathname === "/";

  let isAuthenticated = false;

  // ✅ 1. If accessToken exists, verify it directly
  if (accessToken) {
    isAuthenticated = true;
  }

  // ✅ 3. Handle redirection logic based on authentication status

  // 🚫 If accessing protected route and not authenticated, redirect to login
  if (isProtectedRoute && !accessToken && !refreshToken) {
    console.warn(
      "🚫 Accessing protected route without auth, redirecting to login..."
    );
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 🚫 If accessing login/signup but already authenticated, redirect to home
  if (isLoginOrSignup && isAuthenticated) {
    console.warn("🚫 Already logged in, redirecting to home...");
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ✅ 4. Allow route otherwise
  return NextResponse.next();
}

// ✅ 5. Define routes to apply middleware
export const config = {
  matcher: [
    "/", // All protected routes
    "/login", // Login page
    "/signup", // Signup page
  ],
};
