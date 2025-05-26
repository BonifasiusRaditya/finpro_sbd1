import { StudentRepository } from "@/db/repositories/student.repository";
import { NextRequest, NextResponse } from "next/server";

export default async function POST(request: NextRequest) {
  const {
    student_number,
    password,
    name,
    class: className,
    grade,
    address,
    gender,
    birth_date,
    school_id,
  } = await request.json();

  const student = await StudentRepository.create({
    student_number,
    password,
    name,
    class: className,
    grade,
    address,
    gender,
    birth_date,
    school_id,
  });

  return NextResponse.json({
    success: true,
    message: "Student added successfully",
    student,
  });
}
