import { NextRequest, NextResponse } from "next/server";
import { GovernmentRepository } from "@/db/repositories/government.repository";
import { JWTService } from "@/lib/jwt";
import { LoginRequest, LoginResponse } from "@/types/auth-types";

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();

    // Validate required fields
    if (!body.identifier || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Province ID and password are required",
        },
        { status: 400 }
      );
    }

    const government = await GovernmentRepository.findByProvinceId(
      body.identifier
    );

    if (!government) {
      return NextResponse.json(
        { success: false, message: "Invalid province ID" },
        { status: 401 }
      );
    }

    if (body.password !== government.password) {
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = JWTService.generateGovernmentToken({
      id: government.id,
      province_id: government.province_id,
      province: government.province,
    });

    const response: LoginResponse = {
      success: true,
      token,
      user: {
        id: government.id,
        role: "government",
        name: government.province,
        province_id: government.province_id,
        province: government.province,
        contact_name: government.contact_name,
        contact_email: government.contact_email,
        contact_phone: government.contact_phone,
        address: government.address,
      },
      message: "Login successful",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Government login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
