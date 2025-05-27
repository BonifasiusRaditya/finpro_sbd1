import { NextRequest, NextResponse } from "next/server";
import { SchoolRepository } from "@/db/repositories/school.repository";
import { CreateSchoolRequest, SchoolResponse } from "@/types/school-types";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { GovernmentJWTPayload } from "@/types/auth-types";

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, ["government"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user as GovernmentJWTPayload;

    const body: CreateSchoolRequest = await request.json();

    if (!body.name || !body.npsn || !body.school_id || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: name, npsn, school_id, password",
        },
        { status: 400 }
      );
    }

    if (!/^\d{8}$/.test(body.npsn)) {
      return NextResponse.json(
        {
          success: false,
          message: "NPSN must be exactly 8 digits",
        },
        { status: 400 }
      );
    }

    if (body.password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    const existingSchoolById = await SchoolRepository.findBySchoolId(
      body.school_id
    );
    if (existingSchoolById) {
      return NextResponse.json(
        {
          success: false,
          message: "School ID already exists",
        },
        { status: 409 }
      );
    }

    const existingSchoolByNpsn = await SchoolRepository.findByNpsn(body.npsn);
    if (existingSchoolByNpsn) {
      return NextResponse.json(
        {
          success: false,
          message: "NPSN already exists",
        },
        { status: 409 }
      );
    }

    const newSchool = await SchoolRepository.create(body, user.id);

    const schoolResponse: SchoolResponse = {
      id: newSchool.id,
      name: newSchool.name,
      npsn: newSchool.npsn,
      school_id: newSchool.school_id,
      address: newSchool.address,
      contact_person: newSchool.contact_person,
      contact_email: newSchool.contact_email,
      contact_phone: newSchool.contact_phone,
      government_id: newSchool.government_id,
      created_at: newSchool.created_at,
      updated_at: newSchool.updated_at,
    };

    return NextResponse.json(
      {
        success: true,
        message: "School created successfully",
        data: schoolResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating school:", error);

    if (error instanceof Error) {
      if (
        error.message === "NPSN already exists" ||
        error.message === "School ID already exists"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
          },
          { status: 409 }
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

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, ["government"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user as GovernmentJWTPayload;

    const schools = await SchoolRepository.findByGovernmentId(user.id);

    const schoolsResponse: SchoolResponse[] = schools.map((school) => ({
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
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Schools retrieved successfully",
        data: schoolsResponse,
        count: schoolsResponse.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving schools:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
