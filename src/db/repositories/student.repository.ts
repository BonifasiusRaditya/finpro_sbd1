import pool from "@/config/db.config";
import { Student, StudentExtended } from "@/types/student-types";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export class StudentRepository {
  static async findById(id: string): Promise<Student | null> {
    try {
      const result = await pool.query("SELECT * FROM students WHERE id = $1", [
        id,
      ]);
      return (result.rows[0] as Student) || null;
    } catch (error) {
      console.error("Error finding student by ID:", error);
      throw new Error("Database error occurred");
    }
  }

  static async findByStudentNumber(
    studentNumber: string
  ): Promise<Student | null> {
    try {
      const result = await pool.query(
        "SELECT * FROM students WHERE student_number = $1",
        [studentNumber]
      );
      return (result.rows[0] as Student) || null;
    } catch (error) {
      console.error("Error finding student by student number:", error);
      throw new Error("Database error occurred");
    }
  }

  static async findBySchoolId(
    schoolId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ students: Student[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT 
          id, 
          name, 
          student_number, 
          class,
          grade,
          address, 
          gender,
          birth_date,
          school_id,
          created_at
        FROM students 
        WHERE school_id = $1
      `;
      const queryParams: (string | number)[] = [schoolId];

      if (search) {
        query += ` AND (name ILIKE $2 OR student_number ILIKE $2)`;
        queryParams.push(`%${search}%`);
      }

      query += ` ORDER BY name ASC LIMIT $${queryParams.length + 1} OFFSET $${
        queryParams.length + 2
      }`;
      queryParams.push(limit, offset);

      // Get total count for pagination
      let countQuery =
        "SELECT COUNT(*) as count FROM students WHERE school_id = $1";
      const countParams: (string | number)[] = [schoolId];

      if (search) {
        countQuery += ` AND (name ILIKE $2 OR student_number ILIKE $2)`;
        countParams.push(`%${search}%`);
      }

      const [studentsResult, countResult] = await Promise.all([
        pool.query(query, queryParams),
        pool.query(countQuery, countParams),
      ]);

      return {
        students: studentsResult.rows as Student[],
        total: parseInt(countResult.rows[0].count),
      };
    } catch (error) {
      console.error("Error finding students by school ID:", error);
      throw new Error("Database error occurred");
    }
  }

  static async create(studentData: {
    name: string;
    student_number: string;
    password: string;
    class: string;
    grade: string;
    school_id: string;
    address?: string;
    gender?: string;
    birth_date?: string;
  }): Promise<Student> {
    try {
      // Check if student number already exists
      const existingStudent = await this.findByStudentNumber(
        studentData.student_number
      );
      if (existingStudent) {
        throw new Error("Student number already exists");
      }

      const id = uuidv4();
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(
        studentData.password,
        saltRounds
      );
      const now = new Date().toISOString();

      const result = await pool.query(
        `INSERT INTO students (
          id, name, password, student_number, class, grade, 
          address, gender, birth_date, school_id, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
        RETURNING *`,
        [
          id,
          studentData.name,
          hashedPassword,
          studentData.student_number,
          studentData.class,
          studentData.grade,
          studentData.address || null,
          studentData.gender || null,
          studentData.birth_date || null,
          studentData.school_id,
          now,
          now,
        ]
      );
      return result.rows[0] as Student;
    } catch (error) {
      console.error("Error creating student:", error);
      if (
        error instanceof Error &&
        error.message === "Student number already exists"
      ) {
        throw error;
      }
      throw new Error("Database error occurred");
    }
  }

  static async updateProfile(
    id: string,
    profileData: {
      name?: string;
      address?: string;
      gender?: string;
      birth_date?: string;
    }
  ): Promise<Student | null> {
    try {
      const updateFields: string[] = [];
      const values: unknown[] = [];
      let paramCount = 1;

      if (profileData.name !== undefined) {
        updateFields.push(`name = $${paramCount}`);
        values.push(profileData.name);
        paramCount++;
      }

      if (profileData.address !== undefined) {
        updateFields.push(`address = $${paramCount}`);
        values.push(profileData.address);
        paramCount++;
      }

      if (profileData.gender !== undefined) {
        updateFields.push(`gender = $${paramCount}`);
        values.push(profileData.gender);
        paramCount++;
      }

      if (profileData.birth_date !== undefined) {
        updateFields.push(`birth_date = $${paramCount}`);
        values.push(profileData.birth_date);
        paramCount++;
      }

      if (updateFields.length === 0) {
        throw new Error("No fields to update");
      }

      updateFields.push(`updated_at = $${paramCount}`);
      values.push(new Date().toISOString());
      paramCount++;

      values.push(id);

      const query = `UPDATE students SET ${updateFields.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`;
      const result = await pool.query(query, values);

      return (result.rows[0] as Student) || null;
    } catch (error) {
      console.error("Error updating student profile:", error);
      throw new Error("Database error occurred");
    }
  }

  static async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      // First, get the current password hash
      const student = await this.findById(id);
      if (!student) {
        throw new Error("Student not found");
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        student.password
      );
      if (!isCurrentPasswordValid) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      const result = await pool.query(
        "UPDATE students SET password = $1, updated_at = $2 WHERE id = $3",
        [hashedNewPassword, new Date().toISOString(), id]
      );

      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error changing student password:", error);
      if (
        error instanceof Error &&
        (error.message === "Student not found" ||
          error.message === "Current password is incorrect")
      ) {
        throw error;
      }
      throw new Error("Database error occurred");
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const result = await pool.query("DELETE FROM students WHERE id = $1", [
        id,
      ]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting student:", error);
      throw new Error("Database error occurred");
    }
  }

  static async findAll(): Promise<Student[]> {
    try {
      const result = await pool.query(
        "SELECT * FROM students ORDER BY name ASC"
      );
      return result.rows as Student[];
    } catch (error) {
      console.error("Error finding all students:", error);
      throw new Error("Database error occurred");
    }
  }

  static async findAllExtended(): Promise<StudentExtended[]> {
    try {
      const result = await pool.query(`
        SELECT 
          s.*,
          sc.name as school_name,
          sc.npsn as school_npsn,
          sc.address as school_address
        FROM students s 
        JOIN schools sc ON s.school_id = sc.id
        ORDER BY s.name ASC
      `);
      return result.rows as StudentExtended[];
    } catch (error) {
      console.error("Error finding all extended students:", error);
      throw new Error("Database error occurred");
    }
  }

  static async findAllExtendedBySchoolId(
    schoolId: string
  ): Promise<StudentExtended[]> {
    try {
      const result = await pool.query(
        `
        SELECT 
          s.*,
          sc.name as school_name,
          sc.npsn as school_npsn,
          sc.address as school_address
        FROM students s 
        JOIN schools sc ON s.school_id = sc.id 
        WHERE s.school_id = $1
        ORDER BY s.name ASC
      `,
        [schoolId]
      );
      return result.rows as StudentExtended[];
    } catch (error) {
      console.error("Error finding extended students by school ID:", error);
      throw new Error("Database error occurred");
    }
  }
}
