import jwt, { Secret, SignOptions } from "jsonwebtoken";
import {
  JWTPayload,
  GovernmentJWTPayload,
  SchoolJWTPayload,
  StudentJWTPayload,
} from "@/types/auth-types";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-change-this-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export class JWTService {
  static generateToken(
    payload: GovernmentJWTPayload | SchoolJWTPayload | StudentJWTPayload
  ): string {
    return jwt.sign(
      payload as object,
      JWT_SECRET as Secret,
      {
        expiresIn: JWT_EXPIRES_IN,
      } as SignOptions
    );
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      console.error("JWT verification failed:", error);
      return null;
    }
  }

  static generateGovernmentToken(government: {
    id: string;
    province_id: string;
    province: string;
  }): string {
    const payload: GovernmentJWTPayload = {
      id: government.id,
      role: "government",
      province_id: government.province_id,
      province: government.province,
    };
    return this.generateToken(payload);
  }

  static generateSchoolToken(school: {
    id: string;
    school_id: string;
    npsn: string;
    name: string;
    government_id: string;
  }): string {
    const payload: SchoolJWTPayload = {
      id: school.id,
      role: "school",
      school_id: school.school_id,
      npsn: school.npsn,
      name: school.name,
      government_id: school.government_id,
    };
    return this.generateToken(payload);
  }

  static generateStudentToken(student: {
    id: string;
    student_number: string;
    name: string;
    class: string;
    grade: number;
    school_id: string;
  }): string {
    const payload: StudentJWTPayload = {
      id: student.id,
      role: "student",
      student_number: student.student_number,
      name: student.name,
      class: student.class,
      grade: student.grade,
      school_id: student.school_id,
    };
    return this.generateToken(payload);
  }

  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    return authHeader.substring(7);
  }
}
