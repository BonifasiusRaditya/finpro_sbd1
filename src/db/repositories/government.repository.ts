import pool from "@/config/db.config";
import { Government } from "@/types/government-types";
import bcrypt from "bcrypt";

export class GovernmentRepository {
  static async findById(id: string) {
    const result = await pool.query("SELECT * FROM governments WHERE id = $1", [
      id,
    ]);
    return result.rows[0] as Government;
  }

  static async findByProvinceId(provinceId: string) {
    const result = await pool.query(
      "SELECT * FROM governments WHERE province_id = $1",
      [provinceId]
    );
    return result.rows[0] as Government;
  }

  static async create(government: Government) {
    const result = await pool.query(
      "INSERT INTO governments (id, province_id, name, password, address, contact_person, contact_email, contact_phone, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
      [
        government.id,
        government.province_id,
        government.province,
        government.password,
        government.address,
        government.contact_name,
        government.contact_email,
        government.contact_phone,
        government.created_at,
        government.updated_at,
      ]
    );
    return result.rows[0] as Government;
  }

  static async update(government: Government) {
    const result = await pool.query(
      "UPDATE governments SET province = $1, password = $2, address = $3, contact_name = $4, contact_email = $5, contact_phone = $6, updated_at = $7 WHERE id = $8 RETURNING *",
      [
        government.province,
        government.password,
        government.address,
        government.contact_name,
        government.contact_email,
        government.contact_phone,
        government.updated_at,
        government.id,
      ]
    );
    return result.rows[0] as Government;
  }

  static async delete(id: string) {
    await pool.query("DELETE FROM governments WHERE id = $1", [id]);
  }

  static async verifyPassword(
    province_id: string,
    password: string
  ): Promise<Government | null> {
    try {
      const government = await this.findByProvinceId(province_id);
      if (!government) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        government.password
      );
      if (!isPasswordValid) {
        return null;
      }

      return government;
    } catch (error) {
      console.error("Error verifying government password:", error);
      throw new Error("Database error occurred");
    }
  }
}
