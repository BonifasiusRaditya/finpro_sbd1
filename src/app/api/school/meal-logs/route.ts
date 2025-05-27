import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { SchoolJWTPayload } from "@/types/auth-types";
import { ReceptionLogRepository } from "@/db/repositories/reception-log.repository";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, ["school"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user as SchoolJWTPayload;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    const { logs, total } = await ReceptionLogRepository.findBySchool(
      user.id,
      page,
      limit,
      startDate || undefined,
      endDate || undefined
    );

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        message: "Meal logs retrieved successfully",
        data: {
          meal_logs: logs,
          pagination: {
            current_page: page,
            total_pages: totalPages,
            total_count: total,
            limit,
            has_next: page < totalPages,
            has_prev: page > 1,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving meal logs:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
