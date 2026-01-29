import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateResponseSchema = z.object({
  cardNumber: z.number().min(1).max(10).optional(),
  responseNumber: z.number().min(1).optional(),
  responseText: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  determinants: z.string().min(1).optional(),
  contentCategories: z.string().min(1).optional(),
  ban: z.boolean().optional(),
  obs: z.string().optional().nullable(),
  intenseTime: z.number().optional().nullable(),
  responseTime: z.number().optional().nullable(),
  formQuality: z.string().optional().nullable(),
  cValue: z.string().optional().nullable(),
});

// GET /api/responses/[id] - Get a single response
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await prisma.testResponse.findFirst({
      where: { id: params.id },
      include: {
        test: {
          select: { createdBy: true },
        },
      },
    });

    if (!response) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    // Verify test belongs to user
    if (response.test.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/responses/[id] - Update a response
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if response exists and belongs to user
    const existingResponse = await prisma.testResponse.findFirst({
      where: { id: params.id },
      include: {
        test: {
          select: { createdBy: true },
        },
      },
    });

    if (!existingResponse) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    if (existingResponse.test.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedFields = updateResponseSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      );
    }

    const response = await prisma.testResponse.update({
      where: { id: params.id },
      data: validatedFields.data,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/responses/[id] - Delete a response
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if response exists and belongs to user
    const existingResponse = await prisma.testResponse.findFirst({
      where: { id: params.id },
      include: {
        test: {
          select: { id: true, createdBy: true },
        },
      },
    });

    if (!existingResponse) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    if (existingResponse.test.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.testResponse.delete({
      where: { id: params.id },
    });

    // Update total responses count on the test
    await prisma.rorschachTest.update({
      where: { id: existingResponse.test.id },
      data: {
        totalResponses: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json({ message: "Response deleted successfully" });
  } catch (error) {
    console.error("Error deleting response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
