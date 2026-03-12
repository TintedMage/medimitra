import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prescriptions, prescriptionMedications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * Prescription JSON Schema for AI tool integration:
 * {
 *   id: string;
 *   title: string;
 *   doctorName?: string;
 *   startDate: ISO 8601 date string;
 *   endDate?: ISO 8601 date string;
 *   notes?: string;
 *   medications: Array<{
 *     id?: string;
 *     name: string;
 *     dosage: string;
 *     routine: Array<{
 *       dayOfWeek: 0-6 (Sunday-Saturday);
 *       times: string[] (e.g., ["09:00", "18:00"]);
 *       active: boolean;
 *     }>;
 *     notes?: string;
 *   }>;
 * }
 */

// GET: Retrieve all prescriptions with their medications or filter by specific day
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const day = url.searchParams.get("day");
    const includeInactive = url.searchParams.get("includeInactive") === "true";

    // Get all prescriptions
    const allPrescriptions = await db.select().from(prescriptions).execute();
    
    // Get all medications for these prescriptions
    const prescriptionIds = allPrescriptions.map(p => p.id);
    const allMedications = prescriptionIds.length > 0 
      ? await db.select().from(prescriptionMedications)
          .where(eq(prescriptionMedications.prescriptionId, prescriptionIds[0]))
          .execute()
      : [];

    // Get all medications for all prescriptions properly
    const medicationsByPrescription: Record<string, any[]> = {};
    if (prescriptionIds.length > 0) {
      const medications = await db.select().from(prescriptionMedications).execute();
      medications.forEach(med => {
        if (!medicationsByPrescription[med.prescriptionId]) {
          medicationsByPrescription[med.prescriptionId] = [];
        }
        medicationsByPrescription[med.prescriptionId].push({
          ...med,
          routine: typeof med.routine === "string" ? JSON.parse(med.routine || "[]") : med.routine,
        });
      });
    }

    // Combine prescriptions with their medications
    const prescriptionsWithMeds = allPrescriptions.map(prescription => ({
      ...prescription,
      medications: medicationsByPrescription[prescription.id] || [],
    }));

    if (day) {
      // Filter prescriptions that have active medications on specific day (0-6)
      const dayNum = parseInt(day, 10);
      const filtered = prescriptionsWithMeds.filter(prescription => {
        const now = new Date();
        const startTime = prescription.startDate.getTime();
        const endTime = prescription.endDate?.getTime();
        
        // Check if prescription is currently active
        const isActive = now.getTime() >= startTime && (!endTime || now.getTime() <= endTime);
        if (!isActive && !includeInactive) return false;

        // Check if any medication has routines for this day
        return prescription.medications.some(med => 
          med.routine.some((r: any) => r.dayOfWeek === dayNum && r.active)
        );
      });
      return NextResponse.json(filtered);
    }

    return NextResponse.json(prescriptionsWithMeds);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch prescriptions", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST: Create a new prescription with medications
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, doctorName, startDate, endDate, notes, medications } = body;

    if (!title || !startDate || !medications || !Array.isArray(medications)) {
      return NextResponse.json(
        { error: "Missing required fields: title, startDate, medications (array)" },
        { status: 400 }
      );
    }

    const prescriptionId = randomUUID();
    const now = new Date();

    // Create prescription
    const prescriptionResult = await db
      .insert(prescriptions)
      .values({
        id: prescriptionId,
        title,
        doctorName: doctorName || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        notes: notes || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .execute();

    // Create medications
    const medicationPromises = medications.map((med: any) => {
      const { name, dosage, routine, notes: medNotes } = med;
      
      if (!name || !dosage) {
        throw new Error("Each medication must have name and dosage");
      }

      return db
        .insert(prescriptionMedications)
        .values({
          id: randomUUID(),
          prescriptionId,
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

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create prescription", details: (error as Error).message },
      { status: 500 }
    );
  }
}