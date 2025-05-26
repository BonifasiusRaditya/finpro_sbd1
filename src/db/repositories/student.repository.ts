import pool from "@/config/db.config";
import { Student, StudentExtended } from "@/types/student-types";

export class StudentRepository {
  static async findById(id: string) {
    const result = await pool.query("SELECT * FROM students WHERE id = $1", [
      id,
    ]);
    return result.rows[0] as Student;
  }

  static async findByStudentNumber(studentNumber: string) {
    const result = await pool.query(
      "SELECT * FROM students WHERE student_number = $1",
      [studentNumber]
    );
    return result.rows[0] as Student;
  }

  static async create(student: Student) {
    const result = await pool.query(
      "INSERT INTO students (id, name, password, student_number, class, grade, address, gender, birth_date, school_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
      [
        student.id,
        student.name,
        student.password,
        student.student_number,
        student.class,
        student.grade,
        student.address,
        student.gender,
        student.birth_date,
        student.school_id,
        student.created_at,
        student.updated_at,
      ]
    );
    return result.rows[0] as Student;
  }

  static async update(student: Student) {
    const result = await pool.query(
      "UPDATE students SET name = $1, password = $2, student_number = $3, class = $4, grade = $5, address = $6, gender = $7, birth_date = $8, school_id = $9, updated_at = $10 WHERE id = $11",
      [
        student.name,
        student.password,
        student.student_number,
        student.class,
        student.grade,
        student.address,
        student.gender,
        student.birth_date,
        student.school_id,
        student.updated_at,
        student.id,
      ]
    );
    return result.rows[0] as Student;
  }

  static async delete(id: string) {
    await pool.query("DELETE FROM students WHERE id = $1", [id]);
  }

  static async findAll() {
    const result = await pool.query("SELECT * FROM students");
    return result.rows as Student[];
  }

  static async findAllExtended() {
    const result = await pool.query(
      "SELECT * FROM students JOIN schools ON students.school_id = schools.id"
    );
    return result.rows as StudentExtended[];
  }

  static async findAllExtendedBySchoolId(schoolId: string) {
    const result = await pool.query(
      "SELECT * FROM students JOIN schools ON students.school_id = schools.id WHERE students.school_id = $1",
      [schoolId]
    );
    return result.rows as StudentExtended[];
  }
}
