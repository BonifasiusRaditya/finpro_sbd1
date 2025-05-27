import { NextRequest, NextResponse } from "next/server";
import { MenuRepository } from "@/db/repositories/menu.repository";
import { SchoolRepository } from "@/db/repositories/school.repository";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { GovernmentJWTPayload } from "@/types/auth-types";
import { CreateMenuAllocationRequest } from "@/types/menu-types";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, ["government"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user as GovernmentJWTPayload;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    const { allocations, total } =
      await MenuRepository.findAllocationsByGovernment(
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
        message: "Menu allocations retrieved successfully",
        data: {
          allocations,
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
    console.error("Error retrieving menu allocations:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, ["government"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user as GovernmentJWTPayload;
    const body = await request.json();
    const { school_id, menu_id, quantity, date }: CreateMenuAllocationRequest =
      body;

    // Validation
    if (!school_id || !menu_id || !quantity || !date) {
      return NextResponse.json(
        {
          success: false,
          message: "School ID, menu ID, quantity, and date are required",
        },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        {
          success: false,
          message: "Date must be in YYYY-MM-DD format",
        },
        { status: 400 }
      );
    }

    // Validate quantity
    if (typeof quantity !== "number" || quantity <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity must be a positive number",
        },
        { status: 400 }
      );
    }

    // Verify school belongs to this government
    const school = await SchoolRepository.findById(school_id);
    if (!school) {
      return NextResponse.json(
        {
          success: false,
          message: "School not found",
        },
        { status: 404 }
      );
    }

    if (school.government_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only allocate menus to schools in your province",
        },
        { status: 403 }
      );
    }

    // Verify menu exists
    const menu = await MenuRepository.findById(menu_id);
    if (!menu) {
      return NextResponse.json(
        {
          success: false,
          message: "Menu not found",
        },
        { status: 404 }
      );
    }

    // Validate allocation date is not in the past
    const allocationDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (allocationDate < today) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot allocate menu for past dates",
        },
        { status: 400 }
      );
    }

    const allocationData: CreateMenuAllocationRequest = {
      school_id,
      menu_id,
      quantity,
      date,
    };

    const allocation = await MenuRepository.createAllocation(allocationData);

    // Get the full allocation details for response
    const fullAllocation = await MenuRepository.findAllocationById(
      allocation.id
    );

    return NextResponse.json(
      {
        success: true,
        message: "Menu allocated to school successfully",
        data: fullAllocation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating menu allocation:", error);

    if (error instanceof Error) {
      if (
        error.message.includes(
          "Menu allocation for this school and date already exists"
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Menu allocation for this school and date already exists",
          },
          { status: 409 }
        );
      }
      if (error.message.includes("Invalid school or menu ID")) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid school or menu ID",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
