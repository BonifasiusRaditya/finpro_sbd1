import { NextRequest, NextResponse } from "next/server";
import { JWTService } from "@/lib/jwt";
import { UserRole, JWTPayload } from "@/types/auth-types";

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

// Hierarchical permission levels
const PERMISSION_LEVELS = {
  government: 3, // Highest level - access to everything
  school: 2, // Mid level - access to school resources and students
  student: 1, // Lowest level - access to own resources only
} as const;

export function createAuthMiddleware(
  minimumRole: UserRole,
  options: { strict?: boolean } = {}
) {
  return async (
    request: NextRequest
  ): Promise<NextResponse | { user: JWTPayload }> => {
    try {
      const authHeader = request.headers.get("authorization");
      const token = JWTService.extractTokenFromHeader(authHeader);

      if (!token) {
        return NextResponse.json(
          { success: false, message: "Access token required" },
          { status: 401 }
        );
      }

      const decoded = JWTService.verifyToken(token);
      if (!decoded) {
        return NextResponse.json(
          { success: false, message: "Invalid or expired token" },
          { status: 401 }
        );
      }

      // Check hierarchical permissions
      const userLevel = PERMISSION_LEVELS[decoded.role];
      const requiredLevel = PERMISSION_LEVELS[minimumRole];

      if (options.strict) {
        // Strict mode: exact role match required
        if (decoded.role !== minimumRole) {
          return NextResponse.json(
            { success: false, message: "Insufficient permissions" },
            { status: 403 }
          );
        }
      } else {
        // Hierarchical mode: user level must be >= required level
        if (userLevel < requiredLevel) {
          return NextResponse.json(
            { success: false, message: "Insufficient permissions" },
            { status: 403 }
          );
        }
      }

      return { user: decoded };
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { success: false, message: "Authentication failed" },
        { status: 500 }
      );
    }
  };
}

// Convenience functions for common permission patterns
export const requireGovernment = createAuthMiddleware("government", {
  strict: true,
});
export const requireSchool = createAuthMiddleware("school");
export const requireStudent = createAuthMiddleware("student");
export const requireGovernmentOrSchool = createAuthMiddleware("school"); // Government can access due to hierarchy
export const requireAnyRole = createAuthMiddleware("student"); // Any authenticated user

// Legacy function for backward compatibility - converts array to minimum role
export async function authenticateRequest(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<
  | { success: true; user: JWTPayload }
  | { success: false; response: NextResponse }
> {
  let minimumRole: UserRole = "student";
  if (allowedRoles.includes("government")) {
    minimumRole = "government";
  } else if (allowedRoles.includes("school")) {
    minimumRole = "school";
  }

  const middleware = createAuthMiddleware(minimumRole);
  const result = await middleware(request);

  if ("user" in result) {
    return { success: true, user: result.user };
  } else {
    return { success: false, response: result };
  }
}

// New hierarchical authentication functions
export async function requireMinimumRole(
  request: NextRequest,
  minimumRole: UserRole,
  options: { strict?: boolean } = {}
): Promise<
  | { success: true; user: JWTPayload }
  | { success: false; response: NextResponse }
> {
  const middleware = createAuthMiddleware(minimumRole, options);
  const result = await middleware(request);

  if ("user" in result) {
    return { success: true, user: result.user };
  } else {
    return { success: false, response: result };
  }
}
