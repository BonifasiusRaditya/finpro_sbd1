import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { StudentJWTPayload } from "@/types/auth-types";
import { StudentRepository } from "@/db/repositories/student.repository";
import {
  UpdateStudentProfileRequest,
  StudentProfileResponse,
} from "@/types/student-types";
import pool from "@/config/db.config";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, ["student"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user as StudentJWTPayload;

    // Get student with school information
    const result = await pool.query(
      `SELECT 
        s.id,
        s.name,
        s.student_number,
        s.class,
        s.grade,
        s.address,
        s.gender,
        s.birth_date,
        s.school_id,
        s.created_at,
        sc.name as school_name,
        sc.npsn as school_npsn
      FROM students s
      JOIN schools sc ON s.school_id = sc.id
      WHERE s.id = $1`,
      [user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Student not found",
        },
        { status: 404 }
      );
    }

    const student = result.rows[0];
    const profileResponse: StudentProfileResponse = {
      id: student.id,
      name: student.name,
      student_number: student.student_number,
      class: student.class,
      grade: student.grade,
      address: student.address,
      gender: student.gender,
      birth_date: student.birth_date,
      school_id: student.school_id,
      created_at: student.created_at,
      school_name: student.school_name,
      school_npsn: student.school_npsn,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Profile retrieved successfully",
        data: {
          profile: profileResponse,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving student profile:", error);
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
    const authResult = await authenticateRequest(request, ["student"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user as StudentJWTPayload;
    const body: UpdateStudentProfileRequest = await request.json();

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
    if (body.gender && !["Laki-laki", "Perempuan"].includes(body.gender)) {
      return NextResponse.json(
        {
          success: false,
          message: "Gender must be either 'Laki-laki' or 'Perempuan",
        },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: UpdateStudentProfileRequest = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.address !== undefined) updateData.address = body.address.trim();
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.birth_date !== undefined) updateData.birth_date = body.birth_date;

    const updatedStudent = await StudentRepository.updateProfile(
      user.id,
      updateData
    );

    if (!updatedStudent) {
      return NextResponse.json(
        {
          success: false,
          message: "Student not found",
        },
        { status: 404 }
      );
    }

    // Get updated profile with school information
    const result = await pool.query(
      `SELECT 
        s.id,
        s.name,
        s.student_number,
        s.class,
        s.grade,
        s.address,
        s.gender,
        s.birth_date,
        s.school_id,
        s.created_at,
        sc.name as school_name,
        sc.npsn as school_npsn
      FROM students s
      JOIN schools sc ON s.school_id = sc.id
      WHERE s.id = $1`,
      [user.id]
    );

    const student = result.rows[0];
    const profileResponse: StudentProfileResponse = {
      id: student.id,
      name: student.name,
      student_number: student.student_number,
      class: student.class,
      grade: student.grade,
      address: student.address,
      gender: student.gender,
      birth_date: student.birth_date,
      school_id: student.school_id,
      created_at: student.created_at,
      school_name: student.school_name,
      school_npsn: student.school_npsn,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        data: {
          profile: profileResponse,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating student profile:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
