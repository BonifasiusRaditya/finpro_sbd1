import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { GovernmentJWTPayload } from "@/types/auth-types";
import pool from "@/config/db.config";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, ["government"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user as GovernmentJWTPayload;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    // Build date filter conditions
    let dateFilter = "";
    const queryParams: (string | number)[] = [user.id];

    if (startDate) {
      dateFilter += ` AND sma.date >= $${queryParams.length + 1}`;
      queryParams.push(startDate);
    }

    if (endDate) {
      dateFilter += ` AND sma.date <= $${queryParams.length + 1}`;
      queryParams.push(endDate);
    }

    // Get comprehensive analytics data
    const analyticsQuery = `
      WITH school_stats AS (
        SELECT 
          COUNT(*) as total_schools,
          COUNT(CASE WHEN s.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_schools_30d
        FROM schools s
        WHERE s.government_id = $1
      ),
      menu_stats AS (
        SELECT 
          COUNT(*) as total_menus,
          COUNT(CASE WHEN m.date >= CURRENT_DATE THEN 1 END) as active_menus,
          COUNT(CASE WHEN m.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_menus_30d,
          AVG(m.price_per_portion) as avg_menu_price
        FROM menus m
        WHERE m.created_by = $1
      ),
      allocation_stats AS (
        SELECT 
          COUNT(*) as total_allocations,
          SUM(sma.quantity) as total_portions_allocated,
          SUM(sma.quantity * m.price_per_portion) as total_budget_allocated,
          COUNT(CASE WHEN sma.date >= CURRENT_DATE THEN 1 END) as active_allocations,
          COUNT(CASE WHEN sma.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_allocations_30d
        FROM school_menu_allocations sma
        JOIN menus m ON sma.menu_id = m.id
        JOIN schools s ON sma.school_id = s.id
        WHERE s.government_id = $1 ${dateFilter}
      ),
      distribution_stats AS (
        SELECT 
          COUNT(*) as total_distributions,
          COUNT(DISTINCT rl.student_id) as unique_students_served,
          COUNT(CASE WHEN rl.claimed_at >= CURRENT_DATE THEN 1 END) as today_distributions,
          COUNT(CASE WHEN rl.claimed_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_distributions,
          COUNT(CASE WHEN rl.claimed_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as month_distributions
        FROM reception_logs rl
        JOIN students st ON rl.student_id = st.id
        JOIN schools s ON st.school_id = s.id
        WHERE s.government_id = $1 ${dateFilter.replace(
          "sma.date",
          "rl.claimed_at"
        )}
      ),
      student_stats AS (
        SELECT 
          COUNT(*) as total_students,
          COUNT(CASE WHEN st.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_students_30d
        FROM students st
        JOIN schools s ON st.school_id = s.id
        WHERE s.government_id = $1
      )
      SELECT 
        ss.*,
        ms.*,
        als.*,
        ds.*,
        sts.*
      FROM school_stats ss
      CROSS JOIN menu_stats ms
      CROSS JOIN allocation_stats als
      CROSS JOIN distribution_stats ds
      CROSS JOIN student_stats sts;
    `;

    // Get monthly distribution trends
    const trendsQuery = `
      SELECT 
        DATE_TRUNC('month', rl.claimed_at) as month,
        COUNT(*) as distributions,
        COUNT(DISTINCT rl.student_id) as unique_students,
        SUM(m.price_per_portion) as total_value
      FROM reception_logs rl
      JOIN students st ON rl.student_id = st.id
      JOIN schools s ON st.school_id = s.id
      JOIN school_menu_allocations sma ON sma.school_id = s.id 
        AND DATE(sma.date) = DATE(rl.claimed_at)
      JOIN menus m ON sma.menu_id = m.id
      WHERE s.government_id = $1 
        AND rl.claimed_at >= CURRENT_DATE - INTERVAL '12 months'
        ${dateFilter.replace("sma.date", "rl.claimed_at")}
      GROUP BY DATE_TRUNC('month', rl.claimed_at)
      ORDER BY month DESC
      LIMIT 12;
    `;

    // Get top performing schools
    const topSchoolsQuery = `
      SELECT 
        s.id,
        s.name,
        s.npsn,
        COUNT(rl.id) as total_distributions,
        COUNT(DISTINCT rl.student_id) as unique_students_served,
        COUNT(DISTINCT st.id) as total_students,
        ROUND(
          (COUNT(DISTINCT rl.student_id)::decimal / NULLIF(COUNT(DISTINCT st.id), 0)) * 100, 
          2
        ) as participation_rate
      FROM schools s
      LEFT JOIN students st ON s.id = st.school_id
      LEFT JOIN reception_logs rl ON st.id = rl.student_id
        ${
          dateFilter
            ? `AND rl.claimed_at >= $${queryParams.indexOf(startDate!) + 1}`
            : ""
        }
        ${
          dateFilter && endDate
            ? `AND rl.claimed_at <= $${queryParams.indexOf(endDate!) + 1}`
            : ""
        }
      WHERE s.government_id = $1
      GROUP BY s.id, s.name, s.npsn
      ORDER BY total_distributions DESC
      LIMIT 10;
    `;

    // Get menu popularity
    const menuPopularityQuery = `
      SELECT 
        m.id,
        m.name,
        m.date,
        m.price_per_portion,
        COUNT(rl.id) as distribution_count,
        SUM(sma.quantity) as total_allocated,
        ROUND(
          (COUNT(rl.id)::decimal / NULLIF(SUM(sma.quantity), 0)) * 100, 
          2
        ) as utilization_rate
      FROM menus m
      JOIN school_menu_allocations sma ON m.id = sma.menu_id
      JOIN schools s ON sma.school_id = s.id
      LEFT JOIN reception_logs rl ON rl.student_id IN (
        SELECT st.id FROM students st WHERE st.school_id = s.id
      ) AND DATE(rl.claimed_at) = sma.date
      WHERE s.government_id = $1 ${dateFilter.replace("sma.date", "m.date")}
      GROUP BY m.id, m.name, m.date, m.price_per_portion
      ORDER BY distribution_count DESC
      LIMIT 10;
    `;

    // Execute all queries
    const [
      analyticsResult,
      trendsResult,
      topSchoolsResult,
      menuPopularityResult,
    ] = await Promise.all([
      pool.query(analyticsQuery, queryParams),
      pool.query(trendsQuery, queryParams),
      pool.query(topSchoolsQuery, queryParams),
      pool.query(menuPopularityQuery, queryParams),
    ]);

    const analytics = analyticsResult.rows[0];
    const trends = trendsResult.rows;
    const topSchools = topSchoolsResult.rows;
    const menuPopularity = menuPopularityResult.rows;

    // Calculate efficiency metrics
    const efficiency = {
      distribution_rate:
        analytics.total_distributions && analytics.total_portions_allocated
          ? Math.round(
              (analytics.total_distributions /
                analytics.total_portions_allocated) *
                100
            )
          : 0,
      student_participation_rate:
        analytics.unique_students_served && analytics.total_students
          ? Math.round(
              (analytics.unique_students_served / analytics.total_students) *
                100
            )
          : 0,
      budget_utilization: analytics.total_budget_allocated || 0,
      avg_cost_per_meal:
        analytics.total_distributions && analytics.total_budget_allocated
          ? Math.round(
              analytics.total_budget_allocated / analytics.total_distributions
            )
          : 0,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Analytics data retrieved successfully",
        data: {
          overview: {
            total_schools: parseInt(analytics.total_schools) || 0,
            total_students: parseInt(analytics.total_students) || 0,
            total_menus: parseInt(analytics.total_menus) || 0,
            active_menus: parseInt(analytics.active_menus) || 0,
            total_allocations: parseInt(analytics.total_allocations) || 0,
            active_allocations: parseInt(analytics.active_allocations) || 0,
            total_distributions: parseInt(analytics.total_distributions) || 0,
            unique_students_served:
              parseInt(analytics.unique_students_served) || 0,
            total_portions_allocated:
              parseInt(analytics.total_portions_allocated) || 0,
            total_budget_allocated:
              parseFloat(analytics.total_budget_allocated) || 0,
            avg_menu_price: parseFloat(analytics.avg_menu_price) || 0,
          },
          recent_activity: {
            new_schools_30d: parseInt(analytics.new_schools_30d) || 0,
            new_students_30d: parseInt(analytics.new_students_30d) || 0,
            new_menus_30d: parseInt(analytics.new_menus_30d) || 0,
            new_allocations_30d: parseInt(analytics.new_allocations_30d) || 0,
            today_distributions: parseInt(analytics.today_distributions) || 0,
            week_distributions: parseInt(analytics.week_distributions) || 0,
            month_distributions: parseInt(analytics.month_distributions) || 0,
          },
          efficiency,
          trends: trends.map((row) => ({
            month: row.month,
            distributions: parseInt(row.distributions),
            unique_students: parseInt(row.unique_students),
            total_value: parseFloat(row.total_value) || 0,
          })),
          top_schools: topSchools.map((row) => ({
            id: row.id,
            name: row.name,
            npsn: row.npsn,
            total_distributions: parseInt(row.total_distributions) || 0,
            unique_students_served: parseInt(row.unique_students_served) || 0,
            total_students: parseInt(row.total_students) || 0,
            participation_rate: parseFloat(row.participation_rate) || 0,
          })),
          menu_popularity: menuPopularity.map((row) => ({
            id: row.id,
            name: row.name,
            date: row.date,
            price_per_portion: parseFloat(row.price_per_portion),
            distribution_count: parseInt(row.distribution_count) || 0,
            total_allocated: parseInt(row.total_allocated) || 0,
            utilization_rate: parseFloat(row.utilization_rate) || 0,
          })),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving analytics:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
