import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prescriptions, prescriptionMedications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// GET: Get a single prescription with medications
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const prescription = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.id, id))
      .execute();

    if (prescription.length === 0) {
      return NextResponse.json(
        { error: "Prescription not found" },
        { status: 404 }
      );
    }

    const medications = await db
      .select()
      .from(prescriptionMedications)
      .where(eq(prescriptionMedications.prescriptionId, id))
      .execute();

    const result = {
      ...prescription[0],
      medications: medications.map(med => ({
        ...med,
        routine: typeof med.routine === "string" ? JSON.parse(med.routine || "[]") : med.routine,
      })),
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch prescription", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT: Update a prescription and its medications
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, doctorName, startDate, endDate, notes, medications } = body;

    // Update prescription
    const prescriptionResult = await db
      .update(prescriptions)
      .set({
        ...(title && { title }),
        ...(doctorName !== undefined && { doctorName: doctorName || null }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(notes !== undefined && { notes: notes || null }),
        updatedAt: new Date(),
      })
      .where(eq(prescriptions.id, id))
      .returning()
      .execute();

    if (prescriptionResult.length === 0) {
      return NextResponse.json(
        { error: "Prescription not found" },
        { status: 404 }
      );
    }

    // If medications are provided, replace them entirely
    if (medications && Array.isArray(medications)) {
      // Delete existing medications
      await db
        .delete(prescriptionMedications)
        .where(eq(prescriptionMedications.prescriptionId, id))
        .execute();

      // Create new medications
      const now = new Date();
      const medicationPromises = medications.map((med: any) => {
        const { name, dosage, routine, notes: medNotes } = med;
        
        if (!name || !dosage) {
          throw new Error("Each medication must have name and dosage");
        }

        return db
          .insert(prescriptionMedications)
          .values({
            id: med.id || randomUUID(),
            prescriptionId: id,
            name,
            dosage,
            routine: JSON.stringify(routine || []),
            notes: medNotes || null,
            createdAt: now,
            updatedAt: now,
          })
          .returning()
          .execute();
      });

      const medicationResults = await Promise.all(medicationPromises);

      const result = {
        ...prescriptionResult[0],
        medications: medicationResults.map(mr => ({
          ...mr[0],
          routine: typeof mr[0].routine === "string" ? JSON.parse(mr[0].routine || "[]") : mr[0].routine,
        })),
      };

      return NextResponse.json(result);
    } else {
      // If no medications provided, just return updated prescription with existing medications
      const existingMedications = await db
        .select()
        .from(prescriptionMedications)
        .where(eq(prescriptionMedications.prescriptionId, id))
        .execute();

      const result = {
        ...prescriptionResult[0],
        medications: existingMedications.map(med => ({
          ...med,
          routine: typeof med.routine === "string" ? JSON.parse(med.routine || "[]") : med.routine,
        })),
      };

      return NextResponse.json(result);
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update prescription", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE: Delete a prescription and its medications
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete medications first (cascade should handle this, but being explicit)
    await db
      .delete(prescriptionMedications)
      .where(eq(prescriptionMedications.prescriptionId, id))
      .execute();

    // Delete prescription
    const result = await db
      .delete(prescriptions)
      .where(eq(prescriptions.id, id))
      .returning()
      .execute();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Prescription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deleted: result[0] });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete prescription", details: (error as Error).message },
      { status: 500 }
    );
  }
}