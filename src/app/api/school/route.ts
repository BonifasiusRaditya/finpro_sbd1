import { NextRequest, NextResponse } from "next/server";
import { SchoolRepository } from "@/db/repositories/school.repository";
import { SchoolResponse } from "@/types/school-types";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { SchoolJWTPayload } from "@/types/auth-types";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, ["school"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user as SchoolJWTPayload;
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

    const schoolResponse: SchoolResponse = {
      id: school.id,
      name: school.name,
      npsn: school.npsn,
      school_id: school.school_id,
      address: school.address,
      contact_person: school.contact_person,
      contact_email: school.contact_email,
      contact_phone: school.contact_phone,
      government_id: school.government_id,
      created_at: school.created_at,
      updated_at: school.updated_at,
    };

    return NextResponse.json(
      {
        success: true,
        message: "School data retrieved successfully",
        data: schoolResponse,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving school data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
