import { NextRequest, NextResponse } from "next/server";
import { SchoolRepository } from "@/db/repositories/school.repository";
import { JWTService } from "@/lib/jwt";
import { LoginRequest, LoginResponse } from "@/types/auth-types";

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();

    // Validate required fields
    if (!body.identifier || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message: "School ID and password are required",
        },
        { status: 400 }
      );
    }

    // Verify school credentials
    const school = await SchoolRepository.verifyPassword(
      body.identifier,
      body.password
    );
    if (!school) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid school ID or password",
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = JWTService.generateSchoolToken({
      id: school.id,
      school_id: school.school_id,
      npsn: school.npsn,
      name: school.name,
      government_id: school.government_id,
    });

    const response: LoginResponse = {
      success: true,
      token,
      user: {
        id: school.id,
        role: "school",
        name: school.name,
        school_id: school.school_id,
        npsn: school.npsn,
        address: school.address,
        contact_person: school.contact_person,
        contact_email: school.contact_email,
        contact_phone: school.contact_phone,
        government_id: school.government_id,
      },
      message: "Login successful",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("School login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
