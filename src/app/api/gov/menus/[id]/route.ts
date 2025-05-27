import { NextRequest, NextResponse } from "next/server";
import { MenuRepository } from "@/db/repositories/menu.repository";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { UpdateMenuRequest } from "@/types/menu-types";
import { GovernmentJWTPayload } from "@/types/auth-types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(request, ["government"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await params;
    const user = authResult.user as GovernmentJWTPayload;
    const menu = await MenuRepository.findById(id);

    if (!menu) {
      return NextResponse.json(
        {
          success: false,
          message: "Menu not found",
        },
        { status: 404 }
      );
    }

    // Check if the menu was created by this government
    if (menu.created_by !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Menu not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Menu retrieved successfully",
        data: menu,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving menu:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(request, ["government"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await params;
    const user = authResult.user as GovernmentJWTPayload;
    const body = await request.json();
    const {
      name,
      description,
      date,
      price_per_portion,
      image_url,
    }: UpdateMenuRequest = body;

    // Check if menu exists
    const existingMenu = await MenuRepository.findById(id);
    if (!existingMenu) {
      return NextResponse.json(
        {
          success: false,
          message: "Menu not found",
        },
        { status: 404 }
      );
    }

    // Check if the menu was created by this government
    if (existingMenu.created_by !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Menu not found",
        },
        { status: 404 }
      );
    }

    // Validate date format if provided
    if (date) {
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

      // Validate date is not in the past
      const menuDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (menuDate < today) {
        return NextResponse.json(
          {
            success: false,
            message: "Cannot set menu date to past dates",
          },
          { status: 400 }
        );
      }
    }

    // Validate price if provided
    if (price_per_portion !== undefined) {
      if (typeof price_per_portion !== "number" || price_per_portion <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Price per portion must be a positive number",
          },
          { status: 400 }
        );
      }
    }

    // Validate image_url if provided
    if (
      image_url !== undefined &&
      image_url !== null &&
      typeof image_url !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Image URL must be a string",
        },
        { status: 400 }
      );
    }

    const updateData: UpdateMenuRequest = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (date !== undefined) updateData.date = date;
    if (price_per_portion !== undefined)
      updateData.price_per_portion = price_per_portion;
    if (image_url !== undefined) updateData.image_url = image_url?.trim();

    const updatedMenu = await MenuRepository.update(id, updateData);

    if (!updatedMenu) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update menu",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Menu updated successfully",
        data: updatedMenu,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating menu:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(request, ["government"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await params;
    const user = authResult.user as GovernmentJWTPayload;

    // Check if menu exists
    const existingMenu = await MenuRepository.findById(id);
    if (!existingMenu) {
      return NextResponse.json(
        {
          success: false,
          message: "Menu not found",
        },
        { status: 404 }
      );
    }

    // Check if the menu was created by this government
    if (existingMenu.created_by !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Menu not found",
        },
        { status: 404 }
      );
    }

    const deleted = await MenuRepository.delete(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete menu",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Menu deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting menu:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
