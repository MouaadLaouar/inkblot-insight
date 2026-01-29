import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createResponseSchema = z.object({
  testId: z.string().min(1, "Test ID is required"),
  cardNumber: z.number().min(1).max(10),
  responseNumber: z.number().min(1),
  responseText: z.string().min(1, "Response text is required"),
  location: z.string().min(1, "Location is required"),
  determinants: z.string().min(1, "Determinants are required"),
  contentCategories: z.string().min(1, "Content categories are required"),
  ban: z.boolean().default(false),
  obs: z.string().optional(),
  intenseTime: z.number().optional(),
  responseTime: z.number().optional(),
  formQuality: z.string().optional(),
  cValue: z.string().optional(),
});

// GET /api/responses - Get responses (filter by testId)
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const testId = searchParams.get("testId");

    if (!testId) {
      return NextResponse.json(
        { error: "Test ID is required" },
        { status: 400 }
      );
    }

    // Verify test belongs to user
    const test = await prisma.rorschachTest.findFirst({
      where: {
        id: testId,
        createdBy: session.user.id,
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    const responses = await prisma.testResponse.findMany({
      where: { testId },
      orderBy: [{ cardNumber: "asc" }, { responseNumber: "asc" }],
    });

    return NextResponse.json(responses);
  } catch (error) {
    console.error("Error fetching responses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/responses - Create a new response
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedFields = createResponseSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      );
    }

    const {
      testId,
      cardNumber,
      responseNumber,
      responseText,
      location,
      determinants,
      contentCategories,
      ban,
      obs,
      intenseTime,
      responseTime,
      formQuality,
      cValue,
    } = validatedFields.data;

    // Verify test belongs to user
    const test = await prisma.rorschachTest.findFirst({
      where: {
        id: testId,
        createdBy: session.user.id,
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    const response = await prisma.testResponse.create({
      data: {
        testId,
        cardNumber,
        responseNumber,
        responseText,
        location,
        determinants,
        contentCategories,
        ban,
        obs,
        intenseTime,
        responseTime,
        formQuality,
        cValue,
      },
    });

    // Update total responses count on the test
    await prisma.rorschachTest.update({
      where: { id: testId },
      data: {
        totalResponses: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
