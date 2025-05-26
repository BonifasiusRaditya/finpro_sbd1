import { NextRequest, NextResponse } from "next/server";
import { StudentRepository } from "@/db/repositories/student.repository";
import { JWTService } from "@/lib/jwt";
import { LoginRequest, LoginResponse } from "@/types/auth-types";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();

    if (!body.identifier || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Student number and password are required",
        },
        { status: 400 }
      );
    }

    const student = await StudentRepository.findByStudentNumber(
      body.identifier
    );

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid student number or password",
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      body.password,
      student.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid student number or password",
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = JWTService.generateStudentToken({
      id: student.id!,
      student_number: student.student_number,
      name: student.name,
      class: student.class,
      grade: parseInt(student.grade),
      school_id: student.school_id,
    });

    const response: LoginResponse = {
      success: true,
      token,
      user: {
        id: student.id!,
        role: "student",
        name: student.name,
        student_number: student.student_number,
        class: student.class,
        grade: student.grade,
        address: student.address,
        gender: student.gender,
        birth_date: student.birth_date,
        school_id: student.school_id,
        created_at: student.created_at!,
      },
      message: "Login successful",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error during student login:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
