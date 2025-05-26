import { NextRequest, NextResponse } from "next/server";
import { GovernmentRepository } from "@/db/repositories/government.repository";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  const { province_id, password } = await request.json();

  if (!province_id || !password) {
    return NextResponse.json(
      { success: false, message: "Province ID and password are required" },
      { status: 400 }
    );
  }

  const government = await GovernmentRepository.findByProvinceId(province_id);

  if (!government) {
    return NextResponse.json(
      { success: false, message: "Government not found" },
      { status: 404 }
    );
  }

  // Compare password using bcrypt
  if (password !== government.password) {
    return NextResponse.json(
      { success: false, message: "Invalid password" },
      { status: 401 }
    );
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: government.id,
      province_id: government.province_id,
      province: government.province,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "24h" }
  );

  return NextResponse.json(
    {
      success: true,
      message: "Login successful",
      token: `${token}`,
      government: {
        id: government.id,
        province_id: government.province_id,
        province: government.province,
      },
    },
    { status: 200 }
  );
}
