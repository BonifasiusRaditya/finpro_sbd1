import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { SchoolJWTPayload } from "@/types/auth-types";
import pool from "@/config/db.config";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, ["school"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user as SchoolJWTPayload;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        id, 
        name, 
        student_number, 
        class,
        grade,
        address, 
        gender,
        birth_date
      FROM users 
      WHERE school_id = $1
    `;
    const queryParams: (string | number)[] = [user.id];

    if (search) {
      query += ` AND (name ILIKE $2 OR student_number ILIKE $2)`;
      queryParams.push(`%${search}%`);
    }

    query += ` ORDER BY name ASC LIMIT $${queryParams.length + 1} OFFSET $${
      queryParams.length + 2
    }`;
    queryParams.push(limit, offset);

    const studentsResult = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) as count FROM users WHERE school_id = $1";
    const countParams: (string | number)[] = [user.id];

    if (search) {
      countQuery += ` AND (name ILIKE $2 OR student_number ILIKE $2)`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    const students = studentsResult.rows.map((student) => ({
      id: student.id,
      name: student.name,
      student_number: student.student_number,
      class: student.class,
      grade: student.grade,
      address: student.address,
      gender: student.gender,
      birth_date: student.birth_date,
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Students retrieved successfully",
        data: {
          students,
          pagination: {
            current_page: page,
            total_pages: totalPages,
            total_count: totalCount,
            limit,
            has_next: page < totalPages,
            has_prev: page > 1,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving students:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
