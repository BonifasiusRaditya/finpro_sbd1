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
    const today = new Date().toISOString().split("T")[0];

    // Get today's available menus for the student's school
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
        (sma.quantity - COALESCE(distributed.count, 0)) as available_quantity,
        CASE WHEN claimed.user_id IS NOT NULL THEN true ELSE false END as already_claimed
      FROM school_menu_allocations sma
      JOIN menus m ON sma.menu_id = m.id
      JOIN students s ON sma.school_id = s.school_id
      LEFT JOIN (
        SELECT 
          school_menu_allocation_id,
          COUNT(*) as count
        FROM reception_logs rl
        JOIN students st ON rl.user_id = st.id
        WHERE st.school_id = (SELECT school_id FROM students WHERE id = $1)
        GROUP BY school_menu_allocation_id
      ) distributed ON sma.id = distributed.school_menu_allocation_id
      LEFT JOIN (
        SELECT user_id, school_menu_allocation_id
        FROM reception_logs
        WHERE user_id = $1
      ) claimed ON sma.id = claimed.school_menu_allocation_id
      WHERE s.id = $1 
        AND DATE(sma.date) = $2
        AND (sma.quantity - COALESCE(distributed.count, 0)) > 0
      ORDER BY m.name ASC
    `;

    const result = await pool.query(query, [user.id, today]);

    const availableMenus = result.rows.map((row) => ({
      allocation_id: row.allocation_id,
      menu_id: row.menu_id,
      menu_name: row.menu_name,
      menu_description: row.menu_description,
      menu_date: row.menu_date,
      price_per_portion: row.price_per_portion,
      menu_image_url: row.menu_image_url,
      total_quantity: parseInt(row.total_quantity),
      distributed_count: parseInt(row.distributed_count),
      available_quantity: parseInt(row.available_quantity),
      allocation_date: row.allocation_date,
      already_claimed: row.already_claimed,
    }));

    // Get student's claim status for today
    const claimStatusQuery = `
      SELECT COUNT(*) as claimed_today
      FROM reception_logs rl
      JOIN school_menu_allocations sma ON rl.school_menu_allocation_id = sma.id
      WHERE rl.user_id = $1 AND DATE(rl.received_at) = $2
    `;

    const claimStatusResult = await pool.query(claimStatusQuery, [
      user.id,
      today,
    ]);
    const hasClaimedToday =
      parseInt(claimStatusResult.rows[0].claimed_today) > 0;

    return NextResponse.json(
      {
        success: true,
        message: "Available menus retrieved successfully",
        data: {
          available_menus: availableMenus,
          date: today,
          has_claimed_today: hasClaimedToday,
          can_claim: !hasClaimedToday && availableMenus.length > 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving available menus:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
