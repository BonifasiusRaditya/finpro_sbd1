import { NextRequest, NextResponse } from "next/server";
import { SchoolRepository } from "@/db/repositories/school.repository";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { SchoolJWTPayload } from "@/types/auth-types";
import pool from "@/config/db.config";
import { SchoolDashboardAllocation } from "@/types/reception-log-types";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, ["school"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user as SchoolJWTPayload;
    const school = await SchoolRepository.findById(user.id);

    if (!school) {
      return NextResponse.json(
        {
          success: false,
          message: "School not found",
        },
        { status: 404 }
      );
    }

    // Get student count
    const studentCountQuery = await pool.query(
      "SELECT COUNT(*) as count FROM students WHERE school_id = $1",
      [user.id]
    );
    const studentCount = parseInt(studentCountQuery.rows[0].count);

    // Get comprehensive allocation data with distributed counts using complex query
    const today = new Date().toISOString().split("T")[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split("T")[0];
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split("T")[0];

    // Complex query to get allocation data with distribution counts
    const allocationQuery = await pool.query(
      `
      SELECT 
        sma.id as allocation_id,
        sma.quantity as total_quantity,
        sma.date as allocation_date,
        m.id as menu_id,
        m.name as menu_name,
        m.description as menu_description,
        m.date as menu_date,
        m.image_url as menu_image_url,
        COALESCE(rl_counts.distributed_count, 0) as distributed_count,
        (sma.quantity - COALESCE(rl_counts.distributed_count, 0)) as available_quantity,
        COALESCE(rl_today.today_count, 0) as distributed_today,
        COALESCE(rl_week.week_count, 0) as distributed_this_week,
        COALESCE(rl_month.month_count, 0) as distributed_this_month
      FROM school_menu_allocations sma
      JOIN menus m ON sma.menu_id = m.id
      LEFT JOIN (
        SELECT 
          school_menu_allocation_id,
          COUNT(*) as distributed_count
        FROM reception_logs rl
        JOIN students u ON rl.user_id = u.id
        WHERE u.school_id = $1
        GROUP BY school_menu_allocation_id
      ) rl_counts ON sma.id = rl_counts.school_menu_allocation_id
      LEFT JOIN (
        SELECT 
          school_menu_allocation_id,
          COUNT(*) as today_count
        FROM reception_logs rl
        JOIN students u ON rl.user_id = u.id
        WHERE u.school_id = $1 AND DATE(rl.received_at) = $2
        GROUP BY school_menu_allocation_id
      ) rl_today ON sma.id = rl_today.school_menu_allocation_id
      LEFT JOIN (
        SELECT 
          school_menu_allocation_id,
          COUNT(*) as week_count
        FROM reception_logs rl
        JOIN students u ON rl.user_id = u.id
        WHERE u.school_id = $1 AND DATE(rl.received_at) >= $3
        GROUP BY school_menu_allocation_id
      ) rl_week ON sma.id = rl_week.school_menu_allocation_id
      LEFT JOIN (
        SELECT 
          school_menu_allocation_id,
          COUNT(*) as month_count
        FROM reception_logs rl
        JOIN students u ON rl.user_id = u.id
        WHERE u.school_id = $1 AND DATE(rl.received_at) >= $4
        GROUP BY school_menu_allocation_id
      ) rl_month ON sma.id = rl_month.school_menu_allocation_id
      WHERE sma.school_id = $1
      ORDER BY sma.date DESC, m.name ASC
      `,
      [user.id, today, weekStartStr, monthStartStr]
    );

    const allocations: SchoolDashboardAllocation[] = allocationQuery.rows.map(
      (row) => ({
        allocation_id: row.allocation_id,
        menu_id: row.menu_id,
        menu_name: row.menu_name,
        menu_description: row.menu_description,
        menu_date: row.menu_date,
        menu_image_url: row.menu_image_url,
        total_quantity: parseInt(row.total_quantity),
        distributed_count: parseInt(row.distributed_count),
        available_quantity: parseInt(row.available_quantity),
        allocation_date: row.allocation_date,
      })
    );

    // Calculate summary statistics
    const totalAllocations = allocations.length;
    const totalMealsToday = allocationQuery.rows.reduce(
      (sum, row) => sum + parseInt(row.distributed_today || 0),
      0
    );
    const totalMealsThisWeek = allocationQuery.rows.reduce(
      (sum, row) => sum + parseInt(row.distributed_this_week || 0),
      0
    );
    const totalMealsThisMonth = allocationQuery.rows.reduce(
      (sum, row) => sum + parseInt(row.distributed_this_month || 0),
      0
    );
    const totalQuantityAllocated = allocations.reduce(
      (sum, allocation) => sum + allocation.total_quantity,
      0
    );
    const totalDistributed = allocations.reduce(
      (sum, allocation) => sum + allocation.distributed_count,
      0
    );
    const totalAvailable = allocations.reduce(
      (sum, allocation) => sum + allocation.available_quantity,
      0
    );

    const dashboardData = {
      school: {
        id: school.id,
        name: school.name,
        npsn: school.npsn,
        school_id: school.school_id,
      },
      statistics: {
        total_students: studentCount,
        active_allocations: totalAllocations,
        total_quantity_allocated: totalQuantityAllocated,
        total_distributed: totalDistributed,
        total_available: totalAvailable,
        meals_today: totalMealsToday,
        meals_this_week: totalMealsThisWeek,
        meals_this_month: totalMealsThisMonth,
      },
      allocations: allocations,
      last_updated: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: "Dashboard data retrieved successfully",
        data: dashboardData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving dashboard data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
