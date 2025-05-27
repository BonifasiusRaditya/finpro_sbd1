import { NextRequest, NextResponse } from "next/server";
import { SchoolRepository } from "@/db/repositories/school.repository";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { SchoolJWTPayload } from "@/types/auth-types";
import bcrypt from "bcrypt";

interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, ["school"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user as SchoolJWTPayload;
    const body: ChangePasswordRequest = await request.json();

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

    if (body.new_password !== body.confirm_password) {
      return NextResponse.json(
        {
          success: false,
          message: "New password and confirm password do not match",
        },
        { status: 400 }
      );
    }

    if (body.new_password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "New password must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    const school = await SchoolRepository.findById(user.id);
    if (!school) {
      return NextResponse.json(
        {
          success: false,
          message: "School not found",
        },
        { status: 404 }
      );
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      body.current_password,
      school.password
    );
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password is incorrect",
        },
        { status: 400 }
      );
    }

    const updatedSchool = await SchoolRepository.update(user.id, {
      password: body.new_password,
    });

    if (!updatedSchool) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update password",
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
    console.error("Error changing password:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
