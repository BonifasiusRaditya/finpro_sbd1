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

    // Complex query to get comprehensive dashboard data
    const dashboardQuery = `
      WITH government_schools AS (
        SELECT 
          s.id,
          s.name,
          s.npsn,
          s.school_id,
          s.created_at,
          COUNT(DISTINCT st.id) as total_students
        FROM schools s
        LEFT JOIN students st ON s.id = st.school_id
        WHERE s.government_id = $1
        GROUP BY s.id, s.name, s.npsn, s.school_id, s.created_at
      ),
      menu_stats AS (
        SELECT 
          COUNT(*) as total_menus,
          COUNT(CASE WHEN m.date >= CURRENT_DATE THEN 1 END) as active_menus,
          COUNT(CASE WHEN m.date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_menus,
          AVG(m.price_per_portion) as avg_menu_price,
          SUM(CASE WHEN m.date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 ELSE 0 END) as menus_this_week
        FROM menus m
        WHERE m.created_by = $1
      ),
      allocation_stats AS (
        SELECT 
          COUNT(*) as total_allocations,
          SUM(sma.quantity) as total_portions_allocated,
          SUM(sma.quantity * m.price_per_portion) as total_budget_allocated,
          COUNT(CASE WHEN sma.date >= CURRENT_DATE THEN 1 END) as upcoming_allocations,
          COUNT(CASE WHEN sma.date = CURRENT_DATE THEN 1 END) as today_allocations,
          COUNT(CASE WHEN sma.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_allocations,
          AVG(sma.quantity) as avg_allocation_quantity
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
          COUNT(CASE WHEN rl.claimed_at >= CURRENT_DATE - INTERVAL '1 day' AND rl.claimed_at < CURRENT_DATE THEN 1 END) as yesterday_distributions,
          COUNT(CASE WHEN rl.claimed_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_distributions,
          COUNT(CASE WHEN rl.claimed_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as month_distributions,
          SUM(m.price_per_portion) as total_distribution_value
        FROM reception_logs rl
        JOIN students st ON rl.student_id = st.id
        JOIN schools s ON st.school_id = s.id
        LEFT JOIN school_menu_allocations sma ON sma.school_id = s.id 
          AND DATE(sma.date) = DATE(rl.claimed_at)
        LEFT JOIN menus m ON sma.menu_id = m.id
        WHERE s.government_id = $1 ${dateFilter.replace(
          "sma.date",
          "rl.claimed_at"
        )}
      ),
      school_performance AS (
        SELECT 
          gs.id,
          gs.name,
          gs.npsn,
          gs.total_students,
          COUNT(rl.id) as total_distributions,
          COUNT(DISTINCT rl.student_id) as unique_students_served,
          ROUND(
            CASE 
              WHEN gs.total_students > 0 
              THEN (COUNT(DISTINCT rl.student_id)::decimal / gs.total_students) * 100 
              ELSE 0 
            END, 2
          ) as participation_rate,
          COUNT(CASE WHEN rl.claimed_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_distributions
        FROM government_schools gs
        LEFT JOIN students st ON gs.id = st.school_id
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
        GROUP BY gs.id, gs.name, gs.npsn, gs.total_students
        ORDER BY total_distributions DESC
      ),
      daily_trends AS (
        SELECT 
          DATE(rl.claimed_at) as distribution_date,
          COUNT(*) as daily_distributions,
          COUNT(DISTINCT rl.student_id) as daily_unique_students,
          COUNT(DISTINCT st.school_id) as schools_active,
          SUM(m.price_per_portion) as daily_value
        FROM reception_logs rl
        JOIN students st ON rl.student_id = st.id
        JOIN schools s ON st.school_id = s.id
        LEFT JOIN school_menu_allocations sma ON sma.school_id = s.id 
          AND DATE(sma.date) = DATE(rl.claimed_at)
        LEFT JOIN menus m ON sma.menu_id = m.id
        WHERE s.government_id = $1 
          AND rl.claimed_at >= CURRENT_DATE - INTERVAL '30 days'
          ${dateFilter.replace("sma.date", "rl.claimed_at")}
        GROUP BY DATE(rl.claimed_at)
        ORDER BY distribution_date DESC
        LIMIT 30
      ),
      menu_popularity AS (
        SELECT 
          m.id,
          m.name,
          m.date,
          m.price_per_portion,
          COUNT(rl.id) as distribution_count,
          SUM(sma.quantity) as total_allocated,
          ROUND(
            CASE 
              WHEN SUM(sma.quantity) > 0 
              THEN (COUNT(rl.id)::decimal / SUM(sma.quantity)) * 100 
              ELSE 0 
            END, 2
          ) as utilization_rate,
          COUNT(DISTINCT st.school_id) as schools_served
        FROM menus m
        JOIN school_menu_allocations sma ON m.id = sma.menu_id
        JOIN schools s ON sma.school_id = s.id
        LEFT JOIN reception_logs rl ON rl.student_id IN (
          SELECT st.id FROM students st WHERE st.school_id = s.id
        ) AND DATE(rl.claimed_at) = sma.date
        LEFT JOIN students st ON rl.student_id = st.id
        WHERE s.government_id = $1 ${dateFilter.replace("sma.date", "m.date")}
        GROUP BY m.id, m.name, m.date, m.price_per_portion
        HAVING COUNT(rl.id) > 0
        ORDER BY distribution_count DESC
        LIMIT 10
      ),
      efficiency_metrics AS (
        SELECT 
          ROUND(
            CASE 
              WHEN SUM(sma.quantity) > 0 
              THEN (COUNT(rl.id)::decimal / SUM(sma.quantity)) * 100 
              ELSE 0 
            END, 2
          ) as overall_distribution_rate,
          ROUND(
            CASE 
              WHEN COUNT(DISTINCT st.id) > 0 
              THEN (COUNT(DISTINCT rl.student_id)::decimal / COUNT(DISTINCT st.id)) * 100 
              ELSE 0 
            END, 2
          ) as overall_participation_rate,
          COUNT(DISTINCT s.id) as active_schools,
          COUNT(DISTINCT CASE WHEN rl.claimed_at >= CURRENT_DATE - INTERVAL '7 days' THEN s.id END) as recently_active_schools
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
        LEFT JOIN school_menu_allocations sma ON s.id = sma.school_id
          ${dateFilter}
        WHERE s.government_id = $1
      )
      SELECT 
        -- Overview Statistics
        (SELECT COUNT(*) FROM government_schools) as total_schools,
        (SELECT SUM(total_students) FROM government_schools) as total_students,
        (SELECT COUNT(*) FROM government_schools WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_schools_30d,
        
        -- Menu Statistics
        ms.total_menus,
        ms.active_menus,
        ms.recent_menus,
        ms.avg_menu_price,
        ms.menus_this_week,
        
        -- Allocation Statistics
        als.total_allocations,
        als.total_portions_allocated,
        als.total_budget_allocated,
        als.upcoming_allocations,
        als.today_allocations,
        als.recent_allocations,
        als.avg_allocation_quantity,
        
        -- Distribution Statistics
        ds.total_distributions,
        ds.unique_students_served,
        ds.today_distributions,
        ds.yesterday_distributions,
        ds.week_distributions,
        ds.month_distributions,
        ds.total_distribution_value,
        
        -- Efficiency Metrics
        em.overall_distribution_rate,
        em.overall_participation_rate,
        em.active_schools,
        em.recently_active_schools
        
      FROM menu_stats ms
      CROSS JOIN allocation_stats als
      CROSS JOIN distribution_stats ds
      CROSS JOIN efficiency_metrics em;
    `;

    // Get school performance data
    const schoolPerformanceQuery = `
      SELECT 
        s.id,
        s.name,
        s.npsn,
        COUNT(DISTINCT st.id) as total_students,
        COUNT(rl.id) as total_distributions,
        COUNT(DISTINCT rl.student_id) as unique_students_served,
        ROUND(
          CASE 
            WHEN COUNT(DISTINCT st.id) > 0 
            THEN (COUNT(DISTINCT rl.student_id)::decimal / COUNT(DISTINCT st.id)) * 100 
            ELSE 0 
          END, 2
        ) as participation_rate,
        COUNT(CASE WHEN rl.claimed_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_distributions,
        COUNT(CASE WHEN rl.claimed_at >= CURRENT_DATE THEN 1 END) as today_distributions
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

    // Get daily trends
    const dailyTrendsQuery = `
      SELECT 
        DATE(rl.claimed_at) as date,
        COUNT(*) as distributions,
        COUNT(DISTINCT rl.student_id) as unique_students,
        COUNT(DISTINCT st.school_id) as active_schools,
        COALESCE(SUM(m.price_per_portion), 0) as total_value
      FROM reception_logs rl
      JOIN students st ON rl.student_id = st.id
      JOIN schools s ON st.school_id = s.id
      LEFT JOIN school_menu_allocations sma ON sma.school_id = s.id 
        AND DATE(sma.date) = DATE(rl.claimed_at)
      LEFT JOIN menus m ON sma.menu_id = m.id
      WHERE s.government_id = $1 
        AND rl.claimed_at >= CURRENT_DATE - INTERVAL '14 days'
        ${dateFilter.replace("sma.date", "rl.claimed_at")}
      GROUP BY DATE(rl.claimed_at)
      ORDER BY date DESC;
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
          CASE 
            WHEN SUM(sma.quantity) > 0 
            THEN (COUNT(rl.id)::decimal / SUM(sma.quantity)) * 100 
            ELSE 0 
          END, 2
        ) as utilization_rate,
        COUNT(DISTINCT st.school_id) as schools_served
      FROM menus m
      JOIN school_menu_allocations sma ON m.id = sma.menu_id
      JOIN schools s ON sma.school_id = s.id
      LEFT JOIN reception_logs rl ON rl.student_id IN (
        SELECT st.id FROM students st WHERE st.school_id = s.id
      ) AND DATE(rl.claimed_at) = sma.date
      LEFT JOIN students st ON rl.student_id = st.id
      WHERE s.government_id = $1 ${dateFilter.replace("sma.date", "m.date")}
      GROUP BY m.id, m.name, m.date, m.price_per_portion
      ORDER BY distribution_count DESC
      LIMIT 8;
    `;

    // Get recent activities
    const recentActivitiesQuery = `
      (
        SELECT 
          'school_created' as activity_type,
          s.name as title,
          'New school registered' as description,
          s.created_at as timestamp,
          s.id as entity_id
        FROM schools s
        WHERE s.government_id = $1 
          AND s.created_at >= CURRENT_DATE - INTERVAL '7 days'
      )
      UNION ALL
      (
        SELECT 
          'menu_created' as activity_type,
          m.name as title,
          'New menu created for ' || TO_CHAR(m.date, 'DD Mon YYYY') as description,
          m.created_at as timestamp,
          m.id as entity_id
        FROM menus m
        WHERE m.created_by = $1 
          AND m.created_at >= CURRENT_DATE - INTERVAL '7 days'
      )
      UNION ALL
      (
        SELECT 
          'allocation_created' as activity_type,
          s.name || ' - ' || m.name as title,
          'Menu allocated: ' || sma.quantity || ' portions' as description,
          sma.created_at as timestamp,
          sma.id as entity_id
        FROM school_menu_allocations sma
        JOIN schools s ON sma.school_id = s.id
        JOIN menus m ON sma.menu_id = m.id
        WHERE s.government_id = $1 
          AND sma.created_at >= CURRENT_DATE - INTERVAL '7 days'
      )
      ORDER BY timestamp DESC
      LIMIT 10;
    `;

    // Execute all queries
    const [
      dashboardResult,
      schoolPerformanceResult,
      dailyTrendsResult,
      menuPopularityResult,
      recentActivitiesResult,
    ] = await Promise.all([
      pool.query(dashboardQuery, queryParams),
      pool.query(schoolPerformanceQuery, queryParams),
      pool.query(dailyTrendsQuery, queryParams),
      pool.query(menuPopularityQuery, queryParams),
      pool.query(recentActivitiesQuery, queryParams),
    ]);

    const dashboard = dashboardResult.rows[0];
    const schoolPerformance = schoolPerformanceResult.rows;
    const dailyTrends = dailyTrendsResult.rows;
    const menuPopularity = menuPopularityResult.rows;
    const recentActivities = recentActivitiesResult.rows;

    // Calculate additional metrics
    const distributionGrowth =
      dailyTrends.length >= 2
        ? (dailyTrends[0]?.distributions || 0) -
          (dailyTrends[1]?.distributions || 0)
        : 0;

    const participationGrowth =
      dailyTrends.length >= 2
        ? (dailyTrends[0]?.unique_students || 0) -
          (dailyTrends[1]?.unique_students || 0)
        : 0;

    return NextResponse.json(
      {
        success: true,
        message: "Dashboard data retrieved successfully",
        data: {
          overview: {
            total_schools: parseInt(dashboard.total_schools) || 0,
            total_students: parseInt(dashboard.total_students) || 0,
            new_schools_30d: parseInt(dashboard.new_schools_30d) || 0,
            total_menus: parseInt(dashboard.total_menus) || 0,
            active_menus: parseInt(dashboard.active_menus) || 0,
            recent_menus: parseInt(dashboard.recent_menus) || 0,
            menus_this_week: parseInt(dashboard.menus_this_week) || 0,
            total_allocations: parseInt(dashboard.total_allocations) || 0,
            total_portions_allocated:
              parseInt(dashboard.total_portions_allocated) || 0,
            total_budget_allocated:
              parseFloat(dashboard.total_budget_allocated) || 0,
            upcoming_allocations: parseInt(dashboard.upcoming_allocations) || 0,
            today_allocations: parseInt(dashboard.today_allocations) || 0,
            recent_allocations: parseInt(dashboard.recent_allocations) || 0,
            total_distributions: parseInt(dashboard.total_distributions) || 0,
            unique_students_served:
              parseInt(dashboard.unique_students_served) || 0,
            today_distributions: parseInt(dashboard.today_distributions) || 0,
            yesterday_distributions:
              parseInt(dashboard.yesterday_distributions) || 0,
            week_distributions: parseInt(dashboard.week_distributions) || 0,
            month_distributions: parseInt(dashboard.month_distributions) || 0,
            total_distribution_value:
              parseFloat(dashboard.total_distribution_value) || 0,
            avg_menu_price: parseFloat(dashboard.avg_menu_price) || 0,
            avg_allocation_quantity:
              parseFloat(dashboard.avg_allocation_quantity) || 0,
          },
          efficiency: {
            overall_distribution_rate:
              parseFloat(dashboard.overall_distribution_rate) || 0,
            overall_participation_rate:
              parseFloat(dashboard.overall_participation_rate) || 0,
            active_schools: parseInt(dashboard.active_schools) || 0,
            recently_active_schools:
              parseInt(dashboard.recently_active_schools) || 0,
            distribution_growth: distributionGrowth,
            participation_growth: participationGrowth,
          },
          school_performance: schoolPerformance.map((school) => ({
            id: school.id,
            name: school.name,
            npsn: school.npsn,
            total_students: parseInt(school.total_students) || 0,
            total_distributions: parseInt(school.total_distributions) || 0,
            unique_students_served:
              parseInt(school.unique_students_served) || 0,
            participation_rate: parseFloat(school.participation_rate) || 0,
            recent_distributions: parseInt(school.recent_distributions) || 0,
            today_distributions: parseInt(school.today_distributions) || 0,
          })),
          daily_trends: dailyTrends.map((trend) => ({
            date: trend.date,
            distributions: parseInt(trend.distributions) || 0,
            unique_students: parseInt(trend.unique_students) || 0,
            active_schools: parseInt(trend.active_schools) || 0,
            total_value: parseFloat(trend.total_value) || 0,
          })),
          menu_popularity: menuPopularity.map((menu) => ({
            id: menu.id,
            name: menu.name,
            date: menu.date,
            price_per_portion: parseFloat(menu.price_per_portion) || 0,
            distribution_count: parseInt(menu.distribution_count) || 0,
            total_allocated: parseInt(menu.total_allocated) || 0,
            utilization_rate: parseFloat(menu.utilization_rate) || 0,
            schools_served: parseInt(menu.schools_served) || 0,
          })),
          recent_activities: recentActivities.map((activity) => ({
            activity_type: activity.activity_type,
            title: activity.title,
            description: activity.description,
            timestamp: activity.timestamp,
            entity_id: activity.entity_id,
          })),
        },
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
