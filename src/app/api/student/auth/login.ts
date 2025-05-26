import { NextRequest, NextResponse } from "next/server";
import { StudentRepository } from "@/db/repositories/student.repository";
import bcrypt from "bcrypt";
export async function POST(request: NextRequest) {
  const { student_number, password } = await request.json();

  if (!student_number || !password) {
    return NextResponse.json(
      { success: false, message: "Student number and password are required" },
      { status: 400 }
    );
  }

  const student = await StudentRepository.findByStudentNumber(student_number);

  if (!student) {
    return NextResponse.json(
      { success: false, message: "Student not found" },
      { status: 404 }
    );
  }

  // use bcrypt to compare password
  const isPasswordValid = await bcrypt.compare(password, student.password);

  if (!isPasswordValid) {
    return NextResponse.json(
      { success: false, message: "Invalid password" },
      { status: 401 }
    );
  }

  return NextResponse.json(
    { success: true, message: "Login successful", student },
    { status: 200 }
  );
}
