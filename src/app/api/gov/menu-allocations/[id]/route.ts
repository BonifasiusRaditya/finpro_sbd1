import { NextRequest, NextResponse } from "next/server";
import { MenuRepository } from "@/db/repositories/menu.repository";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { GovernmentJWTPayload } from "@/types/auth-types";
import { UpdateMenuAllocationRequest } from "@/types/menu-types";

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
    const allocation = await MenuRepository.findAllocationById(id);

    if (!allocation) {
      return NextResponse.json(
        {
          success: false,
          message: "Menu allocation not found",
        },
        { status: 404 }
      );
    }

    // Verify the allocation belongs to a school under this government
    if (allocation.school?.id) {
      // We need to check if the school belongs to this government
      // This is already handled in the repository query, but let's be explicit
      const { allocations } = await MenuRepository.findAllocationsByGovernment(
        user.id,
        1,
        1
      );

      const belongsToGovernment = allocations.some((a) => a.id === id);
      if (!belongsToGovernment) {
        return NextResponse.json(
          {
            success: false,
            message: "Menu allocation not found",
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Menu allocation retrieved successfully",
        data: allocation,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving menu allocation:", error);
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
    const { quantity, date }: UpdateMenuAllocationRequest = body;

    // Check if allocation exists and belongs to this government
    const existingAllocation = await MenuRepository.findAllocationById(id);
    if (!existingAllocation) {
      return NextResponse.json(
        {
          success: false,
          message: "Menu allocation not found",
        },
        { status: 404 }
      );
    }

    // Verify the allocation belongs to a school under this government
    const { allocations } = await MenuRepository.findAllocationsByGovernment(
      user.id,
      1,
      1000 // Get more to ensure we find it
    );

    const belongsToGovernment = allocations.some((a) => a.id === id);
    if (!belongsToGovernment) {
      return NextResponse.json(
        {
          success: false,
          message: "Menu allocation not found",
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
      const allocationDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (allocationDate < today) {
        return NextResponse.json(
          {
            success: false,
            message: "Cannot set allocation date to past dates",
          },
          { status: 400 }
        );
      }
    }

    // Validate quantity if provided
    if (quantity !== undefined) {
      if (typeof quantity !== "number" || quantity <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Quantity must be a positive number",
          },
          { status: 400 }
        );
      }
    }

    const updateData: UpdateMenuAllocationRequest = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (date !== undefined) updateData.date = date;

    const updatedAllocation = await MenuRepository.updateAllocation(
      id,
      updateData
    );

    if (!updatedAllocation) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update menu allocation",
        },
        { status: 500 }
      );
    }

    // Get the full allocation details for response
    const fullAllocation = await MenuRepository.findAllocationById(id);

    return NextResponse.json(
      {
        success: true,
        message: "Menu allocation updated successfully",
        data: fullAllocation,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating menu allocation:", error);
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

    // Check if allocation exists and belongs to this government
    const existingAllocation = await MenuRepository.findAllocationById(id);
    if (!existingAllocation) {
      return NextResponse.json(
        {
          success: false,
          message: "Menu allocation not found",
        },
        { status: 404 }
      );
    }

    // Verify the allocation belongs to a school under this government
    const { allocations } = await MenuRepository.findAllocationsByGovernment(
      user.id,
      1,
      1000 // Get more to ensure we find it
    );

    const belongsToGovernment = allocations.some((a) => a.id === id);
    if (!belongsToGovernment) {
      return NextResponse.json(
        {
          success: false,
          message: "Menu allocation not found",
        },
        { status: 404 }
      );
    }

    // Check if allocation has any distributed meals
    // This would prevent deletion if meals have already been distributed
    // You might want to implement this check based on your business logic

    const deleted = await MenuRepository.deleteAllocation(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete menu allocation",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Menu allocation deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting menu allocation:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
