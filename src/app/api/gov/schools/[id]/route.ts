import { NextRequest, NextResponse } from "next/server";
import { SchoolRepository } from "@/db/repositories/school.repository";
import { UpdateSchoolRequest, SchoolResponse } from "@/types/school-types";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { GovernmentJWTPayload } from "@/types/auth-types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(request, ["government"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await params;
    const user = authResult.user as GovernmentJWTPayload;
    const school = await SchoolRepository.findById(id);

    if (!school) {
      return NextResponse.json(
        {
          success: false,
          message: "School not found",
        },
        { status: 404 }
      );
    }

    if (school.government_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied",
        },
        { status: 403 }
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
        message: "School retrieved successfully",
        data: schoolResponse,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving school:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(request, ["government"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await params;
    const user = authResult.user as GovernmentJWTPayload;
    const body: UpdateSchoolRequest = await request.json();

    const existingSchool = await SchoolRepository.findById(id);
    if (!existingSchool) {
      return NextResponse.json(
        {
          success: false,
          message: "School not found",
        },
        { status: 404 }
      );
    }

    if (existingSchool.government_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied",
        },
        { status: 403 }
      );
    }

    if (body.password && body.password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    const updatedSchool = await SchoolRepository.update(id, body);
    if (!updatedSchool) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update school",
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
        message: "School updated successfully",
        data: schoolResponse,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating school:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(request, ["government"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await params;
    const user = authResult.user as GovernmentJWTPayload;
    const existingSchool = await SchoolRepository.findById(id);

    if (!existingSchool) {
      return NextResponse.json(
        {
          success: false,
          message: "School not found",
        },
        { status: 404 }
      );
    }

    if (existingSchool.government_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied",
        },
        { status: 403 }
      );
    }

    const deleted = await SchoolRepository.delete(id);
    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete school",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "School deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting school:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
