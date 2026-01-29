import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateTestSchema = z.object({
  testDate: z.string().optional(),
  status: z.enum(["in_progress", "completed"]).optional(),
  totalResponses: z.number().optional(),
  notes: z.string().optional(),
});

// GET /api/tests/[id] - Get a single test with responses
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const test = await prisma.rorschachTest.findFirst({
      where: {
        id: params.id,
        createdBy: session.user.id,
      },
      include: {
        patient: true,
        responses: {
          orderBy: [{ cardNumber: "asc" }, { responseNumber: "asc" }],
        },
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    return NextResponse.json(test);
  } catch (error) {
    console.error("Error fetching test:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/tests/[id] - Update a test
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if test exists and belongs to user
    const existingTest = await prisma.rorschachTest.findFirst({
      where: {
        id: params.id,
        createdBy: session.user.id,
      },
    });

    if (!existingTest) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedFields = updateTestSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      );
    }

    const test = await prisma.rorschachTest.update({
      where: { id: params.id },
      data: validatedFields.data,
    });

    return NextResponse.json(test);
  } catch (error) {
    console.error("Error updating test:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/tests/[id] - Delete a test
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if test exists and belongs to user
    const existingTest = await prisma.rorschachTest.findFirst({
      where: {
        id: params.id,
        createdBy: session.user.id,
      },
    });

    if (!existingTest) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    await prisma.rorschachTest.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Test deleted successfully" });
  } catch (error) {
    console.error("Error deleting test:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
