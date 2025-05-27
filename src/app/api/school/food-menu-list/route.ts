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
    const status = searchParams.get("status") || ""; // all, active, completed, upcoming
    const dateFrom = searchParams.get("date_from") || "";
    const dateTo = searchParams.get("date_to") || "";
    const sortBy = searchParams.get("sort_by") || "allocation_date"; // allocation_date, name, distributed_count
    const sortOrder = searchParams.get("sort_order") || "desc"; // asc, desc
    const offset = (page - 1) * limit;

    // Build dynamic WHERE clause for filtering
    const whereConditions = ["sma.school_id = $1"];
    const queryParams: (string | number)[] = [user.id];
    let paramIndex = 2;

    if (search) {
      whereConditions.push(
        `(m.name ILIKE $${paramIndex} OR m.description ILIKE $${paramIndex})`
      );
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (dateFrom) {
      whereConditions.push(`sma.date >= $${paramIndex}::date`);
      queryParams.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      whereConditions.push(`sma.date <= $${paramIndex}::date`);
      queryParams.push(dateTo);
      paramIndex++;
    }

    const whereClause = whereConditions.join(" AND ");

    // Build ORDER BY clause
    const validSortColumns = {
      allocation_date: "sma.date",
      name: "m.name",
      distributed_count: "distributed_count",
      price: "m.price_per_portion",
      completion_rate: "completion_rate",
    };
    const sortColumn =
      validSortColumns[sortBy as keyof typeof validSortColumns] || "sma.date";
    const orderDirection = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";

    // Complex query to get menu data with distribution statistics
    const menusQuery = `
      SELECT 
        m.id as menu_id,
        m.name,
        m.description,
        m.date as menu_date,
        m.price_per_portion,
        m.image_url,
        
        sma.id as allocation_id,
        sma.quantity as allocated_quantity,
        sma.date as allocation_date,
        
        -- Distribution statistics
        COALESCE(dist_stats.distributed_count, 0) as distributed_count,
        COALESCE(dist_stats.remaining_quantity, sma.quantity) as remaining_quantity,
        COALESCE(dist_stats.distribution_rate, 0) as completion_rate,
        COALESCE(dist_stats.total_value_distributed, 0) as total_value_distributed,
        
        -- Daily distribution breakdown
        COALESCE(daily_stats.today_distributed, 0) as today_distributed,
        COALESCE(daily_stats.yesterday_distributed, 0) as yesterday_distributed,
        COALESCE(daily_stats.week_distributed, 0) as week_distributed,
        
        -- Student participation
        COALESCE(participation.unique_students, 0) as unique_students_served,
        COALESCE(participation.repeat_students, 0) as repeat_students,
        
        -- Menu status
        CASE 
          WHEN sma.date > CURRENT_DATE THEN 'upcoming'
          WHEN COALESCE(dist_stats.distributed_count, 0) >= sma.quantity THEN 'completed'
          WHEN sma.date <= CURRENT_DATE THEN 'active'
          ELSE 'pending'
        END as menu_status,
        
        -- Time-based metrics
        CASE 
          WHEN sma.date = CURRENT_DATE THEN 'today'
          WHEN sma.date = CURRENT_DATE + INTERVAL '1 day' THEN 'tomorrow'
          WHEN sma.date > CURRENT_DATE THEN 'future'
          WHEN sma.date >= CURRENT_DATE - INTERVAL '7 days' THEN 'recent'
          ELSE 'past'
        END as time_category,
        
        -- Average distribution per day
        CASE 
          WHEN sma.date <= CURRENT_DATE THEN 
            COALESCE(dist_stats.distributed_count, 0) / GREATEST(1, (CURRENT_DATE - sma.date) + 1)
          ELSE 0
        END as avg_daily_distribution

      FROM school_menu_allocations sma
      JOIN menus m ON sma.menu_id = m.id
      
      -- Left join with distribution statistics
      LEFT JOIN (
        SELECT 
          rl.school_menu_allocation_id,
          COUNT(*) as distributed_count,
          sma_inner.quantity - COUNT(*) as remaining_quantity,
          (COUNT(*)::float / sma_inner.quantity * 100) as distribution_rate,
          SUM(m_inner.price_per_portion) as total_value_distributed
        FROM reception_logs rl
        JOIN school_menu_allocations sma_inner ON rl.school_menu_allocation_id = sma_inner.id
        JOIN menus m_inner ON sma_inner.menu_id = m_inner.id
        WHERE sma_inner.school_id = $1
        GROUP BY rl.school_menu_allocation_id, sma_inner.quantity
      ) dist_stats ON sma.id = dist_stats.school_menu_allocation_id
      
      -- Left join with daily distribution statistics
      LEFT JOIN (
        SELECT 
          rl.school_menu_allocation_id,
          COUNT(CASE WHEN DATE(rl.received_at) = CURRENT_DATE THEN 1 END) as today_distributed,
          COUNT(CASE WHEN DATE(rl.received_at) = CURRENT_DATE - INTERVAL '1 day' THEN 1 END) as yesterday_distributed,
          COUNT(CASE WHEN rl.received_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_distributed
        FROM reception_logs rl
        JOIN school_menu_allocations sma_inner ON rl.school_menu_allocation_id = sma_inner.id
        WHERE sma_inner.school_id = $1
        GROUP BY rl.school_menu_allocation_id
      ) daily_stats ON sma.id = daily_stats.school_menu_allocation_id
      
      -- Left join with student participation statistics
      LEFT JOIN (
        SELECT 
          rl.school_menu_allocation_id,
          COUNT(DISTINCT rl.user_id) as unique_students,
          COUNT(*) - COUNT(DISTINCT rl.user_id) as repeat_students
        FROM reception_logs rl
        JOIN school_menu_allocations sma_inner ON rl.school_menu_allocation_id = sma_inner.id
        WHERE sma_inner.school_id = $1
        GROUP BY rl.school_menu_allocation_id
      ) participation ON sma.id = participation.school_menu_allocation_id
      
      WHERE ${whereClause}
      ${
        status && status !== "all"
          ? `AND (
        CASE 
          WHEN sma.date > CURRENT_DATE THEN 'upcoming'
          WHEN COALESCE(dist_stats.distributed_count, 0) >= sma.quantity THEN 'completed'
          WHEN sma.date <= CURRENT_DATE THEN 'active'
          ELSE 'pending'
        END
      ) = '${status}'`
          : ""
      }
      
      ORDER BY ${sortColumn} ${orderDirection}, m.name ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Store parameters for count query before adding limit and offset
    const countQueryParams = [...queryParams];

    queryParams.push(limit, offset);
    const menusResult = await pool.query(menusQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM school_menu_allocations sma
      JOIN menus m ON sma.menu_id = m.id
      WHERE ${whereClause}
      ${
        status && status !== "all"
          ? `AND (
        CASE 
          WHEN sma.date > CURRENT_DATE THEN 'upcoming'
          WHEN EXISTS(
            SELECT 1 FROM reception_logs rl 
            WHERE rl.school_menu_allocation_id = sma.id 
            HAVING COUNT(*) >= sma.quantity
          ) THEN 'completed'
          WHEN sma.date <= CURRENT_DATE THEN 'active'
          ELSE 'pending'
        END
      ) = '${status}'`
          : ""
      }
    `;
    const countResult = await pool.query(countQuery, countQueryParams);
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    // Get overall statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_menus,
        COUNT(CASE WHEN sma.date > CURRENT_DATE THEN 1 END) as upcoming_menus,
        COUNT(CASE WHEN sma.date = CURRENT_DATE THEN 1 END) as today_menus,
        COUNT(CASE WHEN COALESCE(dist_stats.distributed_count, 0) >= sma.quantity THEN 1 END) as completed_menus,
        SUM(sma.quantity) as total_allocated_portions,
        COALESCE(SUM(dist_stats.distributed_count), 0) as total_distributed_portions,
        COALESCE(SUM(dist_stats.total_value_distributed), 0) as total_value_distributed,
        COALESCE(AVG(dist_stats.distribution_rate), 0) as avg_completion_rate
      FROM school_menu_allocations sma
      JOIN menus m ON sma.menu_id = m.id
      LEFT JOIN (
        SELECT 
          rl.school_menu_allocation_id,
          COUNT(*) as distributed_count,
          (COUNT(*)::float / sma_inner.quantity * 100) as distribution_rate,
          SUM(m_inner.price_per_portion) as total_value_distributed
        FROM reception_logs rl
        JOIN school_menu_allocations sma_inner ON rl.school_menu_allocation_id = sma_inner.id
        JOIN menus m_inner ON sma_inner.menu_id = m_inner.id
        WHERE sma_inner.school_id = $1
        GROUP BY rl.school_menu_allocation_id, sma_inner.quantity
      ) dist_stats ON sma.id = dist_stats.school_menu_allocation_id
      WHERE sma.school_id = $1
    `;
    const statsResult = await pool.query(statsQuery, [user.id]);
    const stats = statsResult.rows[0];

    // Format menu data
    const menus = menusResult.rows.map((menu) => ({
      menu_id: menu.menu_id,
      name: menu.name,
      description: menu.description,
      menu_date: menu.menu_date,
      price_per_portion: parseFloat(menu.price_per_portion || 0),
      image_url: menu.image_url,
      allocation: {
        allocation_id: menu.allocation_id,
        allocated_quantity: parseInt(menu.allocated_quantity),
        allocation_date: menu.allocation_date,
        remaining_quantity: parseInt(menu.remaining_quantity),
      },
      distribution: {
        distributed_count: parseInt(menu.distributed_count),
        completion_rate: parseFloat(menu.completion_rate || 0),
        total_value_distributed: parseFloat(menu.total_value_distributed || 0),
        today_distributed: parseInt(menu.today_distributed),
        yesterday_distributed: parseInt(menu.yesterday_distributed),
        week_distributed: parseInt(menu.week_distributed),
        avg_daily_distribution: parseFloat(menu.avg_daily_distribution || 0),
      },
      participation: {
        unique_students_served: parseInt(menu.unique_students_served),
        repeat_students: parseInt(menu.repeat_students),
      },
      status: {
        menu_status: menu.menu_status,
        time_category: menu.time_category,
      },
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Food menu list retrieved successfully",
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
          statistics: {
            total_menus: parseInt(stats.total_menus),
            upcoming_menus: parseInt(stats.upcoming_menus),
            today_menus: parseInt(stats.today_menus),
            completed_menus: parseInt(stats.completed_menus),
            total_allocated_portions: parseInt(stats.total_allocated_portions),
            total_distributed_portions: parseInt(
              stats.total_distributed_portions
            ),
            total_value_distributed: parseFloat(
              stats.total_value_distributed || 0
            ),
            avg_completion_rate: parseFloat(stats.avg_completion_rate || 0),
            overall_efficiency: (
              (parseInt(stats.total_distributed_portions) /
                parseInt(stats.total_allocated_portions)) *
              100
            ).toFixed(1),
          },
          filters: {
            available_statuses: ["all", "active", "completed", "upcoming"],
            sort_options: [
              { value: "allocation_date", label: "Allocation Date" },
              { value: "name", label: "Menu Name" },
              { value: "distributed_count", label: "Distribution Count" },
              { value: "price", label: "Price" },
              { value: "completion_rate", label: "Completion Rate" },
            ],
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving food menu list:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
