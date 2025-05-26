import { NextRequest, NextResponse } from "next/server";
import { MenuRepository } from "@/db/repositories/menu.repository";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { CreateMenuRequest } from "@/types/menu-types";
import { GovernmentJWTPayload } from "@/types/auth-types";

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

    const { menus, total } = await MenuRepository.findAll(
      page,
      limit,
      startDate || undefined,
      endDate || undefined,
      user.id // Filter by government that created the menus
    );

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        message: "Menus retrieved successfully",
        data: {
          menus,
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
    console.error("Error retrieving menus:", error);
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
    const {
      name,
      description,
      date,
      price_per_portion,
      image_url,
    }: CreateMenuRequest = body;

    // Validation
    if (!name || !date || !price_per_portion) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, date, and price_per_portion are required",
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

    // Validate price
    if (typeof price_per_portion !== "number" || price_per_portion <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Price per portion must be a positive number",
        },
        { status: 400 }
      );
    }

    // Validate image_url if provided
    if (image_url && typeof image_url !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Image URL must be a string",
        },
        { status: 400 }
      );
    }

    // Validate date is not in the past
    const menuDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (menuDate < today) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot create menu for past dates",
        },
        { status: 400 }
      );
    }

    const menuData: CreateMenuRequest = {
      name: name.trim(),
      description: description?.trim(),
      date,
      price_per_portion,
      image_url: image_url?.trim(),
    };

    const menu = await MenuRepository.create(menuData, user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Menu created successfully",
        data: menu,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating menu:", error);

    if (error instanceof Error) {
      if (error.message.includes("Menu for this date already exists")) {
        return NextResponse.json(
          {
            success: false,
            message: "Menu for this date already exists",
          },
          { status: 409 }
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
