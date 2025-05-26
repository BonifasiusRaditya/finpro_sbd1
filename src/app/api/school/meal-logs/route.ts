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
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        rl.id,
        rl.user_id,
        rl.menu_id,
        rl.received_at,
        u.name as student_name,
        u.student_number,
        m.name as menu_name,
        m.description as menu_description
      FROM reception_logs rl
      JOIN users u ON rl.user_id = u.id
      JOIN menus m ON rl.menu_id = m.id
      WHERE u.school_id = $1
    `;
    const queryParams: (string | number)[] = [user.id];

    if (startDate) {
      query += ` AND DATE(rl.received_at) >= $${queryParams.length + 1}`;
      queryParams.push(startDate);
    }

    if (endDate) {
      query += ` AND DATE(rl.received_at) <= $${queryParams.length + 1}`;
      queryParams.push(endDate);
    }

    query += ` ORDER BY rl.received_at DESC LIMIT $${
      queryParams.length + 1
    } OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const logsResult = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery =
      "SELECT COUNT(*) as count FROM reception_logs rl JOIN users u ON rl.user_id = u.id WHERE u.school_id = $1";
    const countParams: (string | number)[] = [user.id];

    if (startDate) {
      countQuery += ` AND DATE(rl.received_at) >= $${countParams.length + 1}`;
      countParams.push(startDate);
    }

    if (endDate) {
      countQuery += ` AND DATE(rl.received_at) <= $${countParams.length + 1}`;
      countParams.push(endDate);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    const mealLogs = logsResult.rows.map((log) => ({
      id: log.id,
      user_id: log.user_id,
      menu_id: log.menu_id,
      student_name: log.student_name,
      student_number: log.student_number,
      menu_name: log.menu_name,
      menu_description: log.menu_description,
      distributed_at: log.received_at,
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Meal logs retrieved successfully",
        data: {
          meal_logs: mealLogs,
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
    console.error("Error retrieving meal logs:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
