import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  medicalRecordNumber: z.string().min(1, "Medical record number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/patients - List all patients for the authenticated user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patients = await prisma.patient.findMany({
      where: { createdBy: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { tests: true },
        },
      },
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/patients - Create a new patient
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedFields = patientSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      );
    }

    const { firstName, lastName, medicalRecordNumber, dateOfBirth, gender, notes } =
      validatedFields.data;

    // Check if medical record number already exists for this user
    const existingPatient = await prisma.patient.findFirst({
      where: {
        createdBy: session.user.id,
        medicalRecordNumber,
      },
    });

    if (existingPatient) {
      return NextResponse.json(
        { error: "A patient with this medical record number already exists" },
        { status: 409 }
      );
    }

    const patient = await prisma.patient.create({
      data: {
        firstName,
        lastName,
        medicalRecordNumber,
        dateOfBirth,
        gender,
        notes,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
