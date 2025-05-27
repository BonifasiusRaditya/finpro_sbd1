import { NextRequest, NextResponse } from "next/server";
import { SchoolRepository } from "@/db/repositories/school.repository";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { GovernmentJWTPayload } from "@/types/auth-types";
import { CreateSchoolRequest } from "@/types/school-types";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, ["government"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user as GovernmentJWTPayload;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");

    const schools = await SchoolRepository.findByGovernmentId(user.id);

    // Apply search filter if provided
    const filteredSchools = search
      ? schools.filter(
          (school) =>
            school.name.toLowerCase().includes(search.toLowerCase()) ||
            school.npsn.includes(search) ||
            school.school_id.toLowerCase().includes(search.toLowerCase())
        )
      : schools;

    // Apply pagination
    const total = filteredSchools.length;
    const offset = (page - 1) * limit;
    const paginatedSchools = filteredSchools.slice(offset, offset + limit);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        message: "Schools retrieved successfully",
        data: {
          schools: paginatedSchools,
          pagination: {
            current_page: page,
            total_pages: totalPages,
            total_count: total,
            limit,
            has_next: page < totalPages,
            has_prev: page > 1,
          },
        },
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

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, ["government"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user as GovernmentJWTPayload;
    const body = await request.json();
    const {
      name,
      npsn,
      school_id,
      address,
      contact_phone,
      contact_email,
      contact_person,
      password,
    }: CreateSchoolRequest = body;

    // Validation
    if (!name || !npsn || !school_id || !address || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, NPSN, school ID, address, and password are required",
        },
        { status: 400 }
      );
    }

    // Validate NPSN format (8 digits)
    if (!/^\d{8}$/.test(npsn)) {
      return NextResponse.json(
        {
          success: false,
          message: "NPSN must be exactly 8 digits",
        },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format",
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    const schoolData: CreateSchoolRequest = {
      name,
      npsn,
      school_id,
      address,
      contact_phone,
      contact_email,
      contact_person,
      password,
    };

    const school = await SchoolRepository.create(schoolData, user.id);

    return NextResponse.json(
      {
        success: true,
        message: "School created successfully",
        data: { school },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating school:", error);

    if (error instanceof Error) {
      if (error.message.includes("NPSN already exists")) {
        return NextResponse.json(
          {
            success: false,
            message: "A school with this NPSN already exists",
          },
          { status: 409 }
        );
      }
      if (error.message.includes("School ID already exists")) {
        return NextResponse.json(
          {
            success: false,
            message: "A school with this School ID already exists",
          },
          { status: 409 }
        );
      }
      if (error.message.includes("Email already exists")) {
        return NextResponse.json(
          {
            success: false,
            message: "A school with this email already exists",
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
