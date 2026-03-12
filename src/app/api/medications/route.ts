import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { medications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * Medication JSON Schema for AI tool integration:
 * {
 *   id: string;
 *   name: string;
 *   dosage: string;
 *   startDate: ISO 8601 date string;
 *   endDate?: ISO 8601 date string;
 *   routine: Array<{
 *     dayOfWeek: 0-6 (Sunday-Saturday);
 *     times: string[] (e.g., ["09:00", "18:00"]);
 *     active: boolean;
 *   }>;
 * }
 */

// GET: Retrieve all medications or filter by specific day
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const day = url.searchParams.get("day");

    const allMeds = await db.select().from(medications).execute();

    if (day) {
      // Filter medications active on specific day (0-6)
      const dayNum = parseInt(day, 10);
      const filtered = allMeds.filter((med: any) => {
        const routine = JSON.parse(med.routine || "[]");
        return routine.some((r: any) => r.dayOfWeek === dayNum && r.active);
      });
      return NextResponse.json(filtered);
    }

    return NextResponse.json(allMeds);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch medications", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST: Create a new medication
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, dosage, startDate, endDate, routine } = body;

    if (!name || !dosage || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields: name, dosage, startDate" },
        { status: 400 }
      );
    }

    const id = randomUUID();
    const now = new Date();

    const result = await db
      .insert(medications)
      .values({
        id,
        name,
        dosage,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        routine: JSON.stringify(routine || []),
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .execute();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create medication", details: (error as Error).message },
      { status: 500 }
    );
  }
}
