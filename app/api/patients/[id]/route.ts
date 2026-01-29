import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updatePatientSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  medicalRecordNumber: z.string().min(1).optional(),
  dateOfBirth: z.string().min(1).optional(),
  gender: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/patients/[id] - Get a single patient
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patient = await prisma.patient.findFirst({
      where: {
        id: params.id,
        createdBy: session.user.id,
      },
      include: {
        tests: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/patients/[id] - Update a patient
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if patient exists and belongs to user
    const existingPatient = await prisma.patient.findFirst({
      where: {
        id: params.id,
        createdBy: session.user.id,
      },
    });

    if (!existingPatient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedFields = updatePatientSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten() },
        { status: 400 }
      );
    }

    // If medical record number is being updated, check for duplicates
    if (validatedFields.data.medicalRecordNumber) {
      const duplicate = await prisma.patient.findFirst({
        where: {
          createdBy: session.user.id,
          medicalRecordNumber: validatedFields.data.medicalRecordNumber,
          NOT: { id: params.id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "A patient with this medical record number already exists" },
          { status: 409 }
        );
      }
    }

    const patient = await prisma.patient.update({
      where: { id: params.id },
      data: validatedFields.data,
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/patients/[id] - Delete a patient
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if patient exists and belongs to user
    const existingPatient = await prisma.patient.findFirst({
      where: {
        id: params.id,
        createdBy: session.user.id,
      },
    });

    if (!existingPatient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    await prisma.patient.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
