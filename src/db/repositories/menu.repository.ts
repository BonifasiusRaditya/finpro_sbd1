import pool from "@/config/db.config";
import {
  Menu,
  CreateMenuRequest,
  UpdateMenuRequest,
  SchoolMenuAllocation,
  CreateMenuAllocationRequest,
  UpdateMenuAllocationRequest,
  MenuAllocationResponse,
} from "@/types/menu-types";

export class MenuRepository {
  // Menu CRUD operations
  static async findById(id: string): Promise<Menu | null> {
    try {
      const result = await pool.query("SELECT * FROM menus WHERE id = $1", [
        id,
      ]);
      return (result.rows[0] as Menu) || null;
    } catch (error) {
      console.error("Error finding menu by ID:", error);
      throw new Error("Database error occurred");
    }
  }

  static async findByDate(date: string): Promise<Menu[]> {
    try {
      const result = await pool.query(
        "SELECT * FROM menus WHERE date = $1 ORDER BY name",
        [date]
      );
      return result.rows as Menu[];
    } catch (error) {
      console.error("Error finding menus by date:", error);
      throw new Error("Database error occurred");
    }
  }

  static async findAll(
    page: number = 1,
    limit: number = 10,
    startDate?: string,
    endDate?: string,
    created_by?: string
  ): Promise<{ menus: Menu[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      let query = "SELECT * FROM menus";
      let countQuery = "SELECT COUNT(*) as count FROM menus";
      const queryParams: (string | number)[] = [];
      const conditions: string[] = [];

      if (created_by) {
        conditions.push(`created_by = $${queryParams.length + 1}`);
        queryParams.push(created_by);
      }

      if (startDate) {
        conditions.push(`date >= $${queryParams.length + 1}`);
        queryParams.push(startDate);
      }

      if (endDate) {
        conditions.push(`date <= $${queryParams.length + 1}`);
        queryParams.push(endDate);
      }

      if (conditions.length > 0) {
        const whereClause = ` WHERE ${conditions.join(" AND ")}`;
        query += whereClause;
        countQuery += whereClause;
      }

      query += ` ORDER BY date DESC, name ASC LIMIT $${
        queryParams.length + 1
      } OFFSET $${queryParams.length + 2}`;
      queryParams.push(limit, offset);

      const [menusResult, countResult] = await Promise.all([
        pool.query(query, queryParams),
        pool.query(countQuery, queryParams.slice(0, -2)), // Remove limit and offset for count
      ]);

      return {
        menus: menusResult.rows as Menu[],
        total: parseInt(countResult.rows[0].count),
      };
    } catch (error) {
      console.error("Error finding all menus:", error);
      throw new Error("Database error occurred");
    }
  }

  static async create(
    menuData: CreateMenuRequest,
    created_by: string
  ): Promise<Menu> {
    try {
      const result = await pool.query(
        `INSERT INTO menus (name, description, date, price_per_portion, image_url, created_by) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [
          menuData.name,
          menuData.description,
          menuData.date,
          menuData.price_per_portion,
          menuData.image_url,
          created_by,
        ]
      );
      return result.rows[0] as Menu;
    } catch (error) {
      console.error("Error creating menu:", error);
      if (error instanceof Error && error.message.includes("duplicate key")) {
        throw new Error("Menu for this date already exists");
      }
      throw new Error("Database error occurred");
    }
  }

  static async update(
    id: string,
    menuData: UpdateMenuRequest
  ): Promise<Menu | null> {
    try {
      const updateFields: string[] = [];
      const values: unknown[] = [];
      let paramCount = 1;

      if (menuData.name !== undefined) {
        updateFields.push(`name = $${paramCount}`);
        values.push(menuData.name);
        paramCount++;
      }

      if (menuData.description !== undefined) {
        updateFields.push(`description = $${paramCount}`);
        values.push(menuData.description);
        paramCount++;
      }

      if (menuData.date !== undefined) {
        updateFields.push(`date = $${paramCount}`);
        values.push(menuData.date);
        paramCount++;
      }

      if (menuData.price_per_portion !== undefined) {
        updateFields.push(`price_per_portion = $${paramCount}`);
        values.push(menuData.price_per_portion);
        paramCount++;
      }

      if (menuData.image_url !== undefined) {
        updateFields.push(`image_url = $${paramCount}`);
        values.push(menuData.image_url);
        paramCount++;
      }

      if (updateFields.length === 0) {
        throw new Error("No fields to update");
      }

      values.push(id);

      const query = `UPDATE menus SET ${updateFields.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`;
      const result = await pool.query(query, values);

      return (result.rows[0] as Menu) || null;
    } catch (error) {
      console.error("Error updating menu:", error);
      throw new Error("Database error occurred");
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const result = await pool.query("DELETE FROM menus WHERE id = $1", [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting menu:", error);
      throw new Error("Database error occurred");
    }
  }

  // Menu Allocation operations
  static async findAllocationById(
    id: string
  ): Promise<MenuAllocationResponse | null> {
    try {
      const result = await pool.query(
        `SELECT 
          sma.*,
          m.name as menu_name,
          m.description as menu_description,
          m.date as menu_date,
          m.price_per_portion,
          m.image_url as menu_image_url,
          s.name as school_name,
          s.npsn,
          s.school_id
        FROM school_menu_allocations sma
        JOIN menus m ON sma.menu_id = m.id
        JOIN schools s ON sma.school_id = s.id
        WHERE sma.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        school_id: row.school_id,
        menu_id: row.menu_id,
        quantity: row.quantity,
        date: row.date,
        created_at: row.created_at,
        updated_at: row.updated_at,
        menu: {
          id: row.menu_id,
          name: row.menu_name,
          description: row.menu_description,
          date: row.menu_date,
          price_per_portion: row.price_per_portion,
          image_url: row.menu_image_url,
        },
        school: {
          id: row.school_id,
          name: row.school_name,
          npsn: row.npsn,
          school_id: row.school_id,
        },
      };
    } catch (error) {
      console.error("Error finding allocation by ID:", error);
      throw new Error("Database error occurred");
    }
  }

  static async findAllocationsByGovernment(
    government_id: string,
    page: number = 1,
    limit: number = 10,
    startDate?: string,
    endDate?: string
  ): Promise<{ allocations: MenuAllocationResponse[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT 
          sma.*,
          m.name as menu_name,
          m.description as menu_description,
          m.date as menu_date,
          m.price_per_portion,
          m.image_url as menu_image_url,
          s.name as school_name,
          s.npsn,
          s.school_id
        FROM school_menu_allocations sma
        JOIN menus m ON sma.menu_id = m.id
        JOIN schools s ON sma.school_id = s.id
        WHERE s.government_id = $1
      `;
      let countQuery = `
        SELECT COUNT(*) as count 
        FROM school_menu_allocations sma
        JOIN schools s ON sma.school_id = s.id
        WHERE s.government_id = $1
      `;
      const queryParams: (string | number)[] = [government_id];

      if (startDate) {
        query += ` AND sma.date >= $${queryParams.length + 1}`;
        countQuery += ` AND sma.date >= $${queryParams.length + 1}`;
        queryParams.push(startDate);
      }

      if (endDate) {
        query += ` AND sma.date <= $${queryParams.length + 1}`;
        countQuery += ` AND sma.date <= $${queryParams.length + 1}`;
        queryParams.push(endDate);
      }

      query += ` ORDER BY sma.date DESC, s.name ASC LIMIT $${
        queryParams.length + 1
      } OFFSET $${queryParams.length + 2}`;
      queryParams.push(limit, offset);

      const [allocationsResult, countResult] = await Promise.all([
        pool.query(query, queryParams),
        pool.query(countQuery, queryParams.slice(0, -2)),
      ]);

      const allocations = allocationsResult.rows.map((row) => ({
        id: row.id,
        school_id: row.school_id,
        menu_id: row.menu_id,
        quantity: row.quantity,
        date: row.date,
        created_at: row.created_at,
        updated_at: row.updated_at,
        menu: {
          id: row.menu_id,
          name: row.menu_name,
          description: row.menu_description,
          date: row.menu_date,
          price_per_portion: row.price_per_portion,
          image_url: row.menu_image_url,
        },
        school: {
          id: row.school_id,
          name: row.school_name,
          npsn: row.npsn,
          school_id: row.school_id,
        },
      }));

      return {
        allocations,
        total: parseInt(countResult.rows[0].count),
      };
    } catch (error) {
      console.error("Error finding allocations by government:", error);
      throw new Error("Database error occurred");
    }
  }

  static async createAllocation(
    allocationData: CreateMenuAllocationRequest
  ): Promise<SchoolMenuAllocation> {
    try {
      const result = await pool.query(
        `INSERT INTO school_menu_allocations (school_id, menu_id, quantity, date) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [
          allocationData.school_id,
          allocationData.menu_id,
          allocationData.quantity,
          allocationData.date,
        ]
      );
      return result.rows[0] as SchoolMenuAllocation;
    } catch (error) {
      console.error("Error creating menu allocation:", error);
      if (error instanceof Error && error.message.includes("duplicate key")) {
        throw new Error(
          "Menu allocation for this school and date already exists"
        );
      }
      if (error instanceof Error && error.message.includes("foreign key")) {
        throw new Error("Invalid school or menu ID");
      }
      throw new Error("Database error occurred");
    }
  }

  static async updateAllocation(
    id: string,
    allocationData: UpdateMenuAllocationRequest
  ): Promise<SchoolMenuAllocation | null> {
    try {
      const updateFields: string[] = [];
      const values: unknown[] = [];
      let paramCount = 1;

      if (allocationData.quantity !== undefined) {
        updateFields.push(`quantity = $${paramCount}`);
        values.push(allocationData.quantity);
        paramCount++;
      }

      if (allocationData.date !== undefined) {
        updateFields.push(`date = $${paramCount}`);
        values.push(allocationData.date);
        paramCount++;
      }

      if (updateFields.length === 0) {
        throw new Error("No fields to update");
      }

      values.push(id);

      const query = `UPDATE school_menu_allocations SET ${updateFields.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`;
      const result = await pool.query(query, values);

      return (result.rows[0] as SchoolMenuAllocation) || null;
    } catch (error) {
      console.error("Error updating menu allocation:", error);
      throw new Error("Database error occurred");
    }
  }

  static async deleteAllocation(id: string): Promise<boolean> {
    try {
      const result = await pool.query(
        "DELETE FROM school_menu_allocations WHERE id = $1",
        [id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting menu allocation:", error);
      throw new Error("Database error occurred");
    }
  }
}
