import pool from "@/config/db.config";
import {
  School,
  CreateSchoolRequest,
  UpdateSchoolRequest,
} from "@/types/school-types";
import bcrypt from "bcrypt";

export class SchoolRepository {
  static async findById(id: string): Promise<School | null> {
    try {
      const result = await pool.query("SELECT * FROM schools WHERE id = $1", [
        id,
      ]);
      return (result.rows[0] as School) || null;
    } catch (error) {
      console.error("Error finding school by ID:", error);
      throw new Error("Database error occurred");
    }
  }

  static async findBySchoolId(school_id: string): Promise<School | null> {
    try {
      const result = await pool.query(
        "SELECT * FROM schools WHERE school_id = $1",
        [school_id]
      );
      return (result.rows[0] as School) || null;
    } catch (error) {
      console.error("Error finding school by school_id:", error);
      throw new Error("Database error occurred");
    }
  }

  static async findByNpsn(npsn: string): Promise<School | null> {
    try {
      const result = await pool.query("SELECT * FROM schools WHERE npsn = $1", [
        npsn,
      ]);
      return (result.rows[0] as School) || null;
    } catch (error) {
      console.error("Error finding school by NPSN:", error);
      throw new Error("Database error occurred");
    }
  }

  static async findByGovernmentId(government_id: string): Promise<School[]> {
    try {
      const result = await pool.query(
        "SELECT * FROM schools WHERE government_id = $1 ORDER BY name",
        [government_id]
      );
      return result.rows as School[];
    } catch (error) {
      console.error("Error finding schools by government ID:", error);
      throw new Error("Database error occurred");
    }
  }

  static async create(
    schoolData: CreateSchoolRequest,
    government_id: string
  ): Promise<School> {
    try {
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(schoolData.password, saltRounds);

      const result = await pool.query(
        `INSERT INTO schools (name, npsn, school_id, password, address, contact_person, contact_email, contact_phone, government_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING *`,
        [
          schoolData.name,
          schoolData.npsn,
          schoolData.school_id,
          hashedPassword,
          schoolData.address,
          schoolData.contact_person,
          schoolData.contact_email,
          schoolData.contact_phone,
          government_id,
        ]
      );
      return result.rows[0] as School;
    } catch (error) {
      console.error("Error creating school:", error);
      if (error instanceof Error && error.message.includes("duplicate key")) {
        if (error.message.includes("npsn")) {
          throw new Error("NPSN already exists");
        }
        if (error.message.includes("school_id")) {
          throw new Error("School ID already exists");
        }
      }
      throw new Error("Database error occurred");
    }
  }

  static async update(
    id: string,
    schoolData: UpdateSchoolRequest
  ): Promise<School | null> {
    try {
      const updateFields: string[] = [];
      const values: unknown[] = [];
      let paramCount = 1;

      if (schoolData.name !== undefined) {
        updateFields.push(`name = $${paramCount}`);
        values.push(schoolData.name);
        paramCount++;
      }

      if (schoolData.address !== undefined) {
        updateFields.push(`address = $${paramCount}`);
        values.push(schoolData.address);
        paramCount++;
      }

      if (schoolData.contact_person !== undefined) {
        updateFields.push(`contact_person = $${paramCount}`);
        values.push(schoolData.contact_person);
        paramCount++;
      }

      if (schoolData.contact_email !== undefined) {
        updateFields.push(`contact_email = $${paramCount}`);
        values.push(schoolData.contact_email);
        paramCount++;
      }

      if (schoolData.contact_phone !== undefined) {
        updateFields.push(`contact_phone = $${paramCount}`);
        values.push(schoolData.contact_phone);
        paramCount++;
      }

      if (schoolData.password !== undefined) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(
          schoolData.password,
          saltRounds
        );
        updateFields.push(`password = $${paramCount}`);
        values.push(hashedPassword);
        paramCount++;
      }

      if (updateFields.length === 0) {
        throw new Error("No fields to update");
      }

      values.push(id);

      const query = `UPDATE schools SET ${updateFields.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`;
      const result = await pool.query(query, values);

      return (result.rows[0] as School) || null;
    } catch (error) {
      console.error("Error updating school:", error);
      throw new Error("Database error occurred");
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const result = await pool.query("DELETE FROM schools WHERE id = $1", [
        id,
      ]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting school:", error);
      throw new Error("Database error occurred");
    }
  }

  static async verifyPassword(
    school_id: string,
    password: string
  ): Promise<School | null> {
    try {
      const school = await this.findBySchoolId(school_id);
      if (!school) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, school.password);
      if (!isPasswordValid) {
        return null;
      }

      return school;
    } catch (error) {
      console.error("Error verifying school password:", error);
      throw new Error("Database error occurred");
    }
  }
}
