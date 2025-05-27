import { NextRequest, NextResponse } from "next/server";
import { JWTService } from "@/lib/jwt";

// Define route patterns for different roles
const ROUTE_PATTERNS = {
  student: ["/student"],
  school: ["/school"],
  government: ["/gov", "/government"],
} as const;

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/student/auth/login",
  "/school/auth/login",
  "/gov/auth/login",
  "/login",
  "/register",
  "/",
] as const;

// Define login pages for each role
const LOGIN_PAGES = {
  student: "/student/auth/login",
  school: "/school/auth/login",
  government: "/gov/auth/login",
} as const;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, etc.
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  console.log(`[Middleware] Processing: ${pathname}`);

  // Check if it's a public route
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  if (isPublicRoute) {
    console.log(`[Middleware] Public route: ${pathname}`);
    return NextResponse.next();
  }

  // Try to get user from cookies
  const user = await getCurrentUser(request);

  if (!user) {
    console.log(`[Middleware] No user found, redirecting to appropriate login`);
    // Determine which login page to redirect to based on the route
    const redirectUrl = getLoginPageForRoute(pathname);
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  console.log(`[Middleware] User found: ${user.role} - ${user.id}`);

  // Check if user's role matches the route pattern
  const userRole = user.role as keyof typeof ROUTE_PATTERNS;
  const allowedPatterns = ROUTE_PATTERNS[userRole];

  if (!allowedPatterns) {
    console.log(`[Middleware] Unknown role: ${user.role}`);
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check if current path matches user's allowed patterns
  const hasAccess = allowedPatterns.some((pattern) =>
    pathname.startsWith(pattern)
  );

  if (!hasAccess) {
    console.log(`[Middleware] Access denied for ${user.role} to ${pathname}`);
    // Redirect to user's appropriate dashboard/home page
    const userHomePage = allowedPatterns[0] + "/home";
    return NextResponse.redirect(new URL(userHomePage, request.url));
  }

  console.log(`[Middleware] Access granted for ${user.role} to ${pathname}`);

  // Add user info to headers for server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", user.id);
  requestHeaders.set("x-user-role", user.role);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

async function getCurrentUser(request: NextRequest) {
  try {
    // Try to get token from different cookie names based on route
    const { pathname } = request.nextUrl;
    let tokenCookieName = "student_token"; // default

    if (pathname.startsWith("/school")) {
      tokenCookieName = "school_token";
    } else if (pathname.startsWith("/gov")) {
      tokenCookieName = "government_token";
    }

    const token = request.cookies.get(tokenCookieName)?.value;

    if (!token) {
      return null;
    }

    const decoded = JWTService.verifyToken(token);
    return decoded;
  } catch (error) {
    console.error("[Middleware] Token verification failed:", error);
    return null;
  }
}

function getLoginPageForRoute(pathname: string): string {
  if (pathname.startsWith("/student")) {
    return LOGIN_PAGES.student;
  } else if (pathname.startsWith("/school")) {
    return LOGIN_PAGES.school;
  } else if (pathname.startsWith("/gov")) {
    return LOGIN_PAGES.government;
  }

  // Default to student login for unknown routes
  return LOGIN_PAGES.student;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
