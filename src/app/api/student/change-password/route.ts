import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { StudentJWTPayload } from "@/types/auth-types";
import { StudentRepository } from "@/db/repositories/student.repository";
import { ChangeStudentPasswordRequest } from "@/types/student-types";

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, ["student"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user as StudentJWTPayload;
    const body: ChangeStudentPasswordRequest = await request.json();

    // Validate required fields
    if (
      !body.current_password ||
      !body.new_password ||
      !body.confirm_password
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Current password, new password, and confirm password are required",
        },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (body.new_password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "New password must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    // Validate password confirmation
    if (body.new_password !== body.confirm_password) {
      return NextResponse.json(
        {
          success: false,
          message: "New password and confirm password do not match",
        },
        { status: 400 }
      );
    }

    // Validate that new password is different from current password
    if (body.current_password === body.new_password) {
      return NextResponse.json(
        {
          success: false,
          message: "New password must be different from current password",
        },
        { status: 400 }
      );
    }

    const success = await StudentRepository.changePassword(
      user.id,
      body.current_password,
      body.new_password
    );

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to change password",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Password changed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error changing student password:", error);

    if (error instanceof Error) {
      if (error.message === "Student not found") {
        return NextResponse.json(
          {
            success: false,
            message: "Student not found",
          },
          { status: 404 }
        );
      }

      if (error.message === "Current password is incorrect") {
        return NextResponse.json(
          {
            success: false,
            message: "Current password is incorrect",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
