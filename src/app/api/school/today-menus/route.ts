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
    const today = new Date().toISOString().split("T")[0];

    // Get today's menu allocations for this school
    const query = `
      SELECT 
        sma.id as allocation_id,
        sma.quantity as total_quantity,
        sma.date as allocation_date,
        m.id as menu_id,
        m.name as menu_name,
        m.description as menu_description,
        m.date as menu_date,
        m.price_per_portion,
        m.image_url as menu_image_url,
        COALESCE(distributed.count, 0) as distributed_count,
        (sma.quantity - COALESCE(distributed.count, 0)) as available_quantity
      FROM school_menu_allocations sma
      JOIN menus m ON sma.menu_id = m.id
      LEFT JOIN (
        SELECT 
          school_menu_allocation_id,
          COUNT(*) as count
        FROM reception_logs rl
        JOIN students s ON rl.user_id = s.id
        WHERE s.school_id = $1
        GROUP BY school_menu_allocation_id
      ) distributed ON sma.id = distributed.school_menu_allocation_id
      WHERE sma.school_id = $1 
        AND DATE(sma.date) = $2
        AND (sma.quantity - COALESCE(distributed.count, 0)) > 0
      ORDER BY m.name ASC
    `;

    const result = await pool.query(query, [user.id, today]);

    const todayMenus = result.rows.map((row) => ({
      allocation_id: row.allocation_id,
      menu_id: row.menu_id,
      menu_name: row.menu_name,
      menu_description: row.menu_description,
      menu_date: row.menu_date,
      price_per_portion: parseFloat(row.price_per_portion || 0),
      menu_image_url: row.menu_image_url,
      total_quantity: parseInt(row.total_quantity),
      distributed_count: parseInt(row.distributed_count),
      available_quantity: parseInt(row.available_quantity),
      allocation_date: row.allocation_date,
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Today's menus retrieved successfully",
        data: {
          menus: todayMenus,
          date: today,
          total_menus: todayMenus.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving today's menus:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
