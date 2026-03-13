import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { medications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// PUT: Update a medication
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, dosage, startDate, endDate, routine } = body;

    const result = await db
      .update(medications)
      .set({
        ...(name && { name }),
        ...(dosage && { dosage }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(routine && { routine: JSON.stringify(routine) }),
        updatedAt: new Date(),
      })
      .where(eq(medications.id, id))
      .returning()
      .execute();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Medication not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update medication", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE: Delete a medication
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await db
      .delete(medications)
      .where(eq(medications.id, id))
      .returning()
      .execute();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Medication not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deleted: result[0] });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete medication", details: (error as Error).message },
      { status: 500 }
    );
  }
}
