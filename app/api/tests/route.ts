import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createTestSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  testDate: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/tests - List all tests for the authenticated user
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    const whereClause: any = { createdBy: session.user.id };
    if (patientId) {
      whereClause.patientId = patientId;
    }

    const tests = await prisma.rorschachTest.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: { responses: true },
        },
      },
    });

    return NextResponse.json(tests);
  } catch (error) {
    console.error("Error fetching tests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/tests - Create a new test
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedFields = createTestSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      );
    }

    const { patientId, testDate, notes } = validatedFields.data;

    // Verify patient belongs to user
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        createdBy: session.user.id,
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const test = await prisma.rorschachTest.create({
      data: {
        patientId,
        createdBy: session.user.id,
        testDate: testDate || new Date().toISOString().split("T")[0],
        status: "in_progress",
        notes,
      },
    });

    return NextResponse.json(test, { status: 201 });
  } catch (error) {
    console.error("Error creating test:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
