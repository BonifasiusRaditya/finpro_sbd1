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
    const classFilter = searchParams.get("class") || "";
    const gradeFilter = searchParams.get("grade") || "";
    const dateFrom = searchParams.get("date_from") || "";
    const dateTo = searchParams.get("date_to") || "";
    const offset = (page - 1) * limit;

    // Build dynamic WHERE clause for filtering
    const whereConditions = ["s.school_id = $1"];
    const queryParams: (string | number)[] = [user.id];
    let paramIndex = 2;

    if (search) {
      whereConditions.push(
        `(s.name ILIKE $${paramIndex} OR s.student_number ILIKE $${paramIndex})`
      );
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (classFilter) {
      whereConditions.push(`s.class = $${paramIndex}`);
      queryParams.push(classFilter);
      paramIndex++;
    }

    if (gradeFilter) {
      whereConditions.push(`s.grade = $${paramIndex}`);
      queryParams.push(gradeFilter);
      paramIndex++;
    }

    const whereClause = whereConditions.join(" AND ");

    // Complex query to get student monitoring data with meal statistics
    const studentsQuery = `
      SELECT 
        s.id,
        s.name,
        s.student_number,
        s.class,
        s.grade,
        s.address,
        s.gender,
        s.birth_date,
        s.created_at,
        
        -- Meal statistics
        COALESCE(meal_stats.total_meals_received, 0) as total_meals_received,
        COALESCE(meal_stats.meals_this_week, 0) as meals_this_week,
        COALESCE(meal_stats.meals_this_month, 0) as meals_this_month,
        COALESCE(meal_stats.last_meal_date, null) as last_meal_date,
        COALESCE(meal_stats.total_meal_value, 0) as total_meal_value,
        
        -- Recent meal activity (last 7 days)
        COALESCE(recent_activity.recent_meals, 0) as recent_meals,
        
        -- Attendance rate calculation
        CASE 
          WHEN EXTRACT(DOW FROM CURRENT_DATE) = 0 THEN EXTRACT(DOW FROM CURRENT_DATE) + 7
          ELSE EXTRACT(DOW FROM CURRENT_DATE)
        END as current_weekday,
        
        -- Student status based on recent activity
        CASE 
          WHEN meal_stats.last_meal_date >= CURRENT_DATE - INTERVAL '3 days' THEN 'active'
          WHEN meal_stats.last_meal_date >= CURRENT_DATE - INTERVAL '7 days' THEN 'moderate'
          WHEN meal_stats.last_meal_date IS NOT NULL THEN 'inactive'
          ELSE 'never_claimed'
        END as activity_status

      FROM students s
      
      -- Left join with meal statistics
      LEFT JOIN (
        SELECT 
          rl.user_id,
          COUNT(*) as total_meals_received,
          COUNT(CASE WHEN rl.received_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as meals_this_week,
          COUNT(CASE WHEN rl.received_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as meals_this_month,
          MAX(rl.received_at) as last_meal_date,
          SUM(m.price_per_portion) as total_meal_value
        FROM reception_logs rl
        JOIN school_menu_allocations sma ON rl.school_menu_allocation_id = sma.id
        JOIN menus m ON sma.menu_id = m.id
        WHERE sma.school_id = $1
        ${dateFrom ? `AND rl.received_at >= '${dateFrom}'::date` : ""}
        ${dateTo ? `AND rl.received_at <= '${dateTo}'::date` : ""}
        GROUP BY rl.user_id
      ) meal_stats ON s.id = meal_stats.user_id
      
      -- Left join with recent activity
      LEFT JOIN (
        SELECT 
          rl.user_id,
          COUNT(*) as recent_meals
        FROM reception_logs rl
        JOIN school_menu_allocations sma ON rl.school_menu_allocation_id = sma.id
        WHERE sma.school_id = $1 
        AND rl.received_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY rl.user_id
      ) recent_activity ON s.id = recent_activity.user_id
      
      WHERE ${whereClause}
      ORDER BY s.name ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Store parameters for count query before adding limit and offset
    const countQueryParams = [...queryParams];

    queryParams.push(limit, offset);
    const studentsResult = await pool.query(studentsQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM students s 
      WHERE ${whereClause}
    `;
    const countResult = await pool.query(countQuery, countQueryParams);
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    // Get class and grade options for filtering
    const classGradeQuery = `
      SELECT DISTINCT 
        s.class,
        s.grade
      FROM students s
      WHERE s.school_id = $1
      ORDER BY s.grade, s.class
    `;
    const classGradeResult = await pool.query(classGradeQuery, [user.id]);

    const classes = [
      ...new Set(classGradeResult.rows.map((row) => row.class)),
    ].sort();
    const grades = [
      ...new Set(classGradeResult.rows.map((row) => row.grade)),
    ].sort();

    // Get overall statistics
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT s.id) as total_students,
        COUNT(DISTINCT CASE WHEN meal_stats.last_meal_date >= CURRENT_DATE - INTERVAL '7 days' THEN s.id END) as active_students,
        COUNT(DISTINCT CASE WHEN meal_stats.last_meal_date IS NULL THEN s.id END) as never_claimed_students,
        COALESCE(SUM(meal_stats.total_meals_received), 0) as total_meals_distributed,
        COALESCE(AVG(meal_stats.total_meals_received), 0) as avg_meals_per_student,
        COALESCE(SUM(meal_stats.total_meal_value), 0) as total_meal_value
      FROM students s
      LEFT JOIN (
        SELECT 
          rl.user_id,
          COUNT(*) as total_meals_received,
          MAX(rl.received_at) as last_meal_date,
          SUM(m.price_per_portion) as total_meal_value
        FROM reception_logs rl
        JOIN school_menu_allocations sma ON rl.school_menu_allocation_id = sma.id
        JOIN menus m ON sma.menu_id = m.id
        WHERE sma.school_id = $1
        GROUP BY rl.user_id
      ) meal_stats ON s.id = meal_stats.user_id
      WHERE s.school_id = $1
    `;
    const statsResult = await pool.query(statsQuery, [user.id]);
    const stats = statsResult.rows[0];

    // Format student data
    const students = studentsResult.rows.map((student) => ({
      id: student.id,
      name: student.name,
      student_number: student.student_number,
      class: student.class,
      grade: student.grade,
      address: student.address,
      gender: student.gender,
      birth_date: student.birth_date,
      created_at: student.created_at,
      meal_statistics: {
        total_meals_received: parseInt(student.total_meals_received),
        meals_this_week: parseInt(student.meals_this_week),
        meals_this_month: parseInt(student.meals_this_month),
        last_meal_date: student.last_meal_date,
        total_meal_value: parseFloat(student.total_meal_value || 0),
        recent_meals: parseInt(student.recent_meals),
        activity_status: student.activity_status,
      },
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Student monitoring data retrieved successfully",
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
          filters: {
            classes,
            grades,
          },
          statistics: {
            total_students: parseInt(stats.total_students),
            active_students: parseInt(stats.active_students),
            never_claimed_students: parseInt(stats.never_claimed_students),
            total_meals_distributed: parseInt(stats.total_meals_distributed),
            avg_meals_per_student: parseFloat(
              stats.avg_meals_per_student
            ).toFixed(2),
            total_meal_value: parseFloat(stats.total_meal_value || 0),
            activity_rate: (
              (parseInt(stats.active_students) /
                parseInt(stats.total_students)) *
              100
            ).toFixed(1),
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving student monitoring data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
