import { NextRequest, NextResponse } from "next/server";
import { SchoolRepository } from "@/db/repositories/school.repository";
import { UpdateSchoolRequest, SchoolResponse } from "@/types/school-types";
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
        message: "School profile retrieved successfully",
        data: schoolResponse,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving school profile:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, ["school"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user as SchoolJWTPayload;
    const body: UpdateSchoolRequest = await request.json();

    const updatedSchool = await SchoolRepository.update(user.id, body);
    if (!updatedSchool) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update school profile",
        },
        { status: 500 }
      );
    }

    const schoolResponse: SchoolResponse = {
      id: updatedSchool.id,
      name: updatedSchool.name,
      npsn: updatedSchool.npsn,
      school_id: updatedSchool.school_id,
      address: updatedSchool.address,
      contact_person: updatedSchool.contact_person,
      contact_email: updatedSchool.contact_email,
      contact_phone: updatedSchool.contact_phone,
      government_id: updatedSchool.government_id,
      created_at: updatedSchool.created_at,
      updated_at: updatedSchool.updated_at,
    };

    return NextResponse.json(
      {
        success: true,
        message: "School profile updated successfully",
        data: schoolResponse,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating school profile:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
