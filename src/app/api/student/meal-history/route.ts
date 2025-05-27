import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { StudentJWTPayload } from "@/types/auth-types";
import pool from "@/config/db.config";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, ["student"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user as StudentJWTPayload;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    const offset = (page - 1) * limit;

    // Build query to get student's meal history
    let query = `
      SELECT 
        rl.id,
        rl.received_at,
        m.name as menu_name,
        m.description as menu_description,
        m.date as menu_date,
        m.price_per_portion,
        m.image_url as menu_image_url,
        sma.quantity as allocation_quantity,
        sma.date as allocation_date
      FROM reception_logs rl
      JOIN school_menu_allocations sma ON rl.school_menu_allocation_id = sma.id
      JOIN menus m ON sma.menu_id = m.id
      WHERE rl.user_id = $1
    `;

    let countQuery = `
      SELECT COUNT(*) as count 
      FROM reception_logs rl 
      JOIN school_menu_allocations sma ON rl.school_menu_allocation_id = sma.id
      WHERE rl.user_id = $1
    `;

    const queryParams: (string | number)[] = [user.id];

    // Add date filters if provided
    if (startDate) {
      query += ` AND DATE(rl.received_at) >= $${queryParams.length + 1}`;
      countQuery += ` AND DATE(rl.received_at) >= $${queryParams.length + 1}`;
      queryParams.push(startDate);
    }

    if (endDate) {
      query += ` AND DATE(rl.received_at) <= $${queryParams.length + 1}`;
      countQuery += ` AND DATE(rl.received_at) <= $${queryParams.length + 1}`;
      queryParams.push(endDate);
    }

    // Add ordering and pagination
    query += ` ORDER BY rl.received_at DESC LIMIT $${
      queryParams.length + 1
    } OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    // Execute queries
    const [historyResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2)),
    ]);

    const mealHistory = historyResult.rows.map((row) => ({
      id: row.id,
      received_at: row.received_at,
      menu_name: row.menu_name,
      menu_description: row.menu_description,
      menu_date: row.menu_date,
      price_per_portion: row.price_per_portion,
      menu_image_url: row.menu_image_url,
      allocation_quantity: parseInt(row.allocation_quantity),
      allocation_date: row.allocation_date,
    }));

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    // Get summary statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_meals_claimed,
        COUNT(CASE WHEN DATE(rl.received_at) = CURRENT_DATE THEN 1 END) as meals_today,
        COUNT(CASE WHEN DATE(rl.received_at) >= DATE_TRUNC('week', CURRENT_DATE) THEN 1 END) as meals_this_week,
        COUNT(CASE WHEN DATE(rl.received_at) >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as meals_this_month,
        COALESCE(SUM(m.price_per_portion), 0) as total_value
      FROM reception_logs rl
      JOIN school_menu_allocations sma ON rl.school_menu_allocation_id = sma.id
      JOIN menus m ON sma.menu_id = m.id
      WHERE rl.user_id = $1
    `;

    const statsResult = await pool.query(statsQuery, [user.id]);
    const stats = statsResult.rows[0];

    return NextResponse.json(
      {
        success: true,
        message: "Meal history retrieved successfully",
        data: {
          meal_history: mealHistory,
          statistics: {
            total_meals_claimed: parseInt(stats.total_meals_claimed),
            meals_today: parseInt(stats.meals_today),
            meals_this_week: parseInt(stats.meals_this_week),
            meals_this_month: parseInt(stats.meals_this_month),
            total_value: parseFloat(stats.total_value),
          },
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
    console.error("Error retrieving student meal history:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
