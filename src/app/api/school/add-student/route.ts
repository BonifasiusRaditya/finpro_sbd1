import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { SchoolJWTPayload } from "@/types/auth-types";
import { StudentRepository } from "@/db/repositories/student.repository";
import { CreateStudentRequest, StudentResponse } from "@/types/student-types";

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, ["school"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user as SchoolJWTPayload;
    const body: CreateStudentRequest = await request.json();

    // Validate required fields
    if (
      !body.name ||
      !body.student_number ||
      !body.password ||
      !body.class ||
      !body.grade
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name, student number, password, class, and grade are required",
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (body.password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    // Validate date format if provided
    if (body.birth_date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(body.birth_date)) {
        return NextResponse.json(
          {
            success: false,
            message: "Birth date must be in YYYY-MM-DD format",
          },
          { status: 400 }
        );
      }
    }

    // Validate gender if provided
    if (
      body.gender &&
      !["male", "female"].includes(body.gender.toLowerCase())
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Gender must be either 'male' or 'female'",
        },
        { status: 400 }
      );
    }

    const student = await StudentRepository.create({
      name: body.name.trim(),
      student_number: body.student_number.trim(),
      password: body.password,
      class: body.class.trim(),
      grade: body.grade.trim(),
      school_id: user.id,
      address: body.address?.trim(),
      gender: body.gender?.toLowerCase(),
      birth_date: body.birth_date,
    });

    const studentResponse: StudentResponse = {
      id: student.id!,
      name: student.name,
      student_number: student.student_number,
      class: student.class,
      grade: student.grade,
      address: student.address,
      gender: student.gender,
      birth_date: student.birth_date,
      school_id: student.school_id,
      created_at: student.created_at!,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Student account created successfully",
        data: {
          student: studentResponse,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating student:", error);

    if (error instanceof Error) {
      if (error.message === "Student number already exists") {
        return NextResponse.json(
          {
            success: false,
            message: "Student number already exists",
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
