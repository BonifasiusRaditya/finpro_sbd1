import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/middleware/auth.middleware";
import { SchoolJWTPayload } from "@/types/auth-types";
import { ReceptionLogRepository } from "@/db/repositories/reception-log.repository";
import pool from "@/config/db.config";

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, ["school"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user as SchoolJWTPayload;
    const body = await request.json();
    const { student_qr_code, allocation_id } = body;

    // Validation
    if (!student_qr_code || !allocation_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Student QR code and allocation ID are required",
        },
        { status: 400 }
      );
    }

    // Parse QR code to extract student number (format: mbgku-{student_number})
    const qrCodePattern = /^mbgku-(.+)$/;
    const match = student_qr_code.match(qrCodePattern);

    if (!match) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid QR code format. Expected format: mbgku-{student_number}",
        },
        { status: 400 }
      );
    }

    const studentNumber = match[1];

    // Find student by student number and verify they belong to this school
    const studentQuery = `
      SELECT id, name, student_number, class, grade 
      FROM students 
      WHERE student_number = $1 AND school_id = $2
    `;
    const studentResult = await pool.query(studentQuery, [
      studentNumber,
      user.id,
    ]);

    if (studentResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Student not found or does not belong to this school",
        },
        { status: 404 }
      );
    }

    const student = studentResult.rows[0];

    // Verify the allocation belongs to this school and is valid
    const allocationQuery = `
      SELECT 
        sma.id,
        sma.quantity,
        sma.date,
        m.name as menu_name,
        m.description as menu_description,
        m.price_per_portion,
        COALESCE(distributed.count, 0) as distributed_count
      FROM school_menu_allocations sma
      JOIN menus m ON sma.menu_id = m.id
      LEFT JOIN (
        SELECT 
          school_menu_allocation_id,
          COUNT(*) as count
        FROM reception_logs rl
        JOIN students s ON rl.user_id = s.id
        WHERE s.school_id = $2
        GROUP BY school_menu_allocation_id
      ) distributed ON sma.id = distributed.school_menu_allocation_id
      WHERE sma.id = $1 AND sma.school_id = $2
    `;
    const allocationResult = await pool.query(allocationQuery, [
      allocation_id,
      user.id,
    ]);

    if (allocationResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Menu allocation not found or does not belong to this school",
        },
        { status: 404 }
      );
    }

    const allocation = allocationResult.rows[0];
    const availableQuantity =
      allocation.quantity - allocation.distributed_count;

    // Check if there are available portions
    if (availableQuantity <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No more portions available for this menu allocation",
        },
        { status: 400 }
      );
    }

    // Check if student has already claimed this allocation
    const hasAlreadyClaimed =
      await ReceptionLogRepository.hasStudentClaimedAllocation(
        student.id,
        allocation_id
      );

    if (hasAlreadyClaimed) {
      return NextResponse.json(
        {
          success: false,
          message: "Student has already claimed this meal allocation",
        },
        { status: 409 }
      );
    }

    // Create reception log entry
    const receptionLog = await ReceptionLogRepository.create({
      user_id: student.id,
      school_menu_allocation_id: allocation_id,
    });

    // Get updated allocation info
    const updatedAllocationResult = await pool.query(allocationQuery, [
      allocation_id,
      user.id,
    ]);
    const updatedAllocation = updatedAllocationResult.rows[0];

    return NextResponse.json(
      {
        success: true,
        message: "Meal claimed successfully",
        data: {
          reception_log: {
            id: receptionLog.id,
            received_at: receptionLog.received_at,
          },
          student: {
            id: student.id,
            name: student.name,
            student_number: student.student_number,
            class: student.class,
            grade: student.grade,
          },
          menu: {
            name: allocation.menu_name,
            description: allocation.menu_description,
            price_per_portion: allocation.price_per_portion,
          },
          allocation: {
            id: allocation_id,
            date: allocation.date,
            total_quantity: allocation.quantity,
            distributed_count: updatedAllocation.distributed_count,
            remaining_quantity:
              allocation.quantity - updatedAllocation.distributed_count,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing meal claim:", error);

    if (error instanceof Error) {
      if (
        error.message.includes(
          "Student has already claimed this meal allocation"
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Student has already claimed this meal allocation",
          },
          { status: 409 }
        );
      }
      if (error.message.includes("Invalid user or allocation ID")) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid student or allocation ID",
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
