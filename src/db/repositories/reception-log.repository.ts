import pool from "@/config/db.config";
import {
  ReceptionLog,
  CreateReceptionLogRequest,
  ReceptionLogResponse,
} from "@/types/reception-log-types";

export class ReceptionLogRepository {
  // Create a new reception log (student claims a meal)
  static async create(
    logData: CreateReceptionLogRequest
  ): Promise<ReceptionLog> {
    try {
      const result = await pool.query(
        `INSERT INTO reception_logs (user_id, school_menu_allocation_id, date) 
         VALUES ($1, $2, CURRENT_DATE) 
         RETURNING *`,
        [logData.user_id, logData.school_menu_allocation_id]
      );
      return result.rows[0] as ReceptionLog;
    } catch (error) {
      console.error("Error creating reception log:", error);
      if (error instanceof Error && error.message.includes("duplicate key")) {
        throw new Error("Student has already claimed this meal allocation");
      }
      if (error instanceof Error && error.message.includes("foreign key")) {
        throw new Error("Invalid user or allocation ID");
      }
      throw new Error("Database error occurred");
    }
  }

  // Find reception log by ID
  static async findById(id: string): Promise<ReceptionLog | null> {
    try {
      const result = await pool.query(
        "SELECT * FROM reception_logs WHERE id = $1",
        [id]
      );
      return (result.rows[0] as ReceptionLog) || null;
    } catch (error) {
      console.error("Error finding reception log by ID:", error);
      throw new Error("Database error occurred");
    }
  }

  // Check if student has already claimed a specific allocation
  static async hasStudentClaimedAllocation(
    userId: string,
    allocationId: string
  ): Promise<boolean> {
    try {
      const result = await pool.query(
        "SELECT id FROM reception_logs WHERE user_id = $1 AND school_menu_allocation_id = $2",
        [userId, allocationId]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error checking if student claimed allocation:", error);
      throw new Error("Database error occurred");
    }
  }

  // Get reception logs for a school with detailed information
  static async findBySchool(
    schoolId: string,
    page: number = 1,
    limit: number = 10,
    startDate?: string,
    endDate?: string
  ): Promise<{ logs: ReceptionLogResponse[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT 
          rl.id,
          rl.user_id,
          rl.school_menu_allocation_id,
          rl.received_at,
          u.name as student_name,
          u.student_number,
          m.name as menu_name,
          m.description as menu_description,
          m.date as menu_date,
          sma.quantity as allocation_quantity
        FROM reception_logs rl
        JOIN students u ON rl.user_id = u.id
        JOIN school_menu_allocations sma ON rl.school_menu_allocation_id = sma.id
        JOIN menus m ON sma.menu_id = m.id
        WHERE u.school_id = $1
      `;
      let countQuery = `
        SELECT COUNT(*) as count 
        FROM reception_logs rl 
        JOIN students u ON rl.user_id = u.id 
        JOIN school_menu_allocations sma ON rl.school_menu_allocation_id = sma.id
        WHERE u.school_id = $1
      `;
      const queryParams: (string | number)[] = [schoolId];

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

      query += ` ORDER BY rl.received_at DESC LIMIT $${
        queryParams.length + 1
      } OFFSET $${queryParams.length + 2}`;
      queryParams.push(limit, offset);

      const [logsResult, countResult] = await Promise.all([
        pool.query(query, queryParams),
        pool.query(countQuery, queryParams.slice(0, -2)),
      ]);

      const logs: ReceptionLogResponse[] = logsResult.rows.map((log) => ({
        id: log.id,
        user_id: log.user_id,
        school_menu_allocation_id: log.school_menu_allocation_id,
        received_at: log.received_at,
        student_name: log.student_name,
        student_number: log.student_number,
        menu_name: log.menu_name,
        menu_description: log.menu_description,
        menu_date: log.menu_date,
        allocation_quantity: parseInt(log.allocation_quantity),
        distributed_at: log.received_at,
      }));

      return {
        logs,
        total: parseInt(countResult.rows[0].count),
      };
    } catch (error) {
      console.error("Error finding reception logs by school:", error);
      throw new Error("Database error occurred");
    }
  }

  // Get count of distributed meals for an allocation
  static async getDistributedCountForAllocation(
    allocationId: string
  ): Promise<number> {
    try {
      const result = await pool.query(
        "SELECT COUNT(*) as count FROM reception_logs WHERE school_menu_allocation_id = $1",
        [allocationId]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error("Error getting distributed count for allocation:", error);
      throw new Error("Database error occurred");
    }
  }

  // Delete reception log (if needed for admin purposes)
  static async delete(id: string): Promise<boolean> {
    try {
      const result = await pool.query(
        "DELETE FROM reception_logs WHERE id = $1",
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting reception log:", error);
      throw new Error("Database error occurred");
    }
  }
}
