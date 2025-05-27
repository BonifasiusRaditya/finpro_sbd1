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
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        m.id,
        m.name,
        m.description,
        m.date,
        m.price_per_portion,
        sma.quantity,
        sma.date as allocation_date
      FROM school_menu_allocations sma
      JOIN menus m ON sma.menu_id = m.id
      WHERE sma.school_id = $1
      ORDER BY sma.date DESC
      LIMIT $2 OFFSET $3
    `;

    const menusResult = await pool.query(query, [user.id, limit, offset]);

    // Get total count for pagination
    const countQuery =
      "SELECT COUNT(*) as count FROM school_menu_allocations WHERE school_id = $1";
    const countResult = await pool.query(countQuery, [user.id]);
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    const menus = menusResult.rows.map((menu) => ({
      id: menu.id,
      name: menu.name,
      description: menu.description,
      date: menu.date,
      price_per_portion: menu.price_per_portion,
      allocated_quantity: menu.quantity,
      allocation_date: menu.allocation_date,
    }));

    return NextResponse.json(
      {
        success: true,
        message: "School menus retrieved successfully",
        data: {
          menus,
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
    console.error("Error retrieving school menus:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
