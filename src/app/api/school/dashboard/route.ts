import { NextRequest, NextResponse } from "next/server";
import { SchoolRepository } from "@/db/repositories/school.repository";
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

    // Get today's meal distribution count
    const today = new Date().toISOString().split("T")[0];
    const todayMealsQuery = await pool.query(
      "SELECT COUNT(*) as count FROM reception_logs rl JOIN students u ON rl.user_id = u.id WHERE u.school_id = $1 AND DATE(rl.received_at) = $2",
      [user.id, today]
    );
    const todayMealsCount = parseInt(todayMealsQuery.rows[0].count);

    // Get this week's meal distribution count
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split("T")[0];

    const weekMealsQuery = await pool.query(
      "SELECT COUNT(*) as count FROM reception_logs rl JOIN students u ON rl.user_id = u.id WHERE u.school_id = $1 AND DATE(rl.received_at) >= $2",
      [user.id, weekStartStr]
    );
    const weekMealsCount = parseInt(weekMealsQuery.rows[0].count);

    // Get this month's meal distribution count
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split("T")[0];

    const monthMealsQuery = await pool.query(
      "SELECT COUNT(*) as count FROM reception_logs rl JOIN students u ON rl.user_id = u.id WHERE u.school_id = $1 AND DATE(rl.received_at) >= $2",
      [user.id, monthStartStr]
    );
    const monthMealsCount = parseInt(monthMealsQuery.rows[0].count);

    // Get active menu count
    const activeMenuQuery = await pool.query(
      "SELECT COUNT(*) as count FROM school_menu_allocations WHERE school_id = $1",
      [user.id]
    );
    const activeMenuCount = parseInt(activeMenuQuery.rows[0].count);

    const dashboardData = {
      school: {
        id: school.id,
        name: school.name,
        npsn: school.npsn,
        school_id: school.school_id,
      },
      statistics: {
        total_students: studentCount,
        active_menus: activeMenuCount,
        meals_today: todayMealsCount,
        meals_this_week: weekMealsCount,
        meals_this_month: monthMealsCount,
      },
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
