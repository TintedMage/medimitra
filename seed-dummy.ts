import { desc } from "drizzle-orm";
import { db } from "./src/lib/db/index.js";
import { prescriptions, prescriptionMedications } from "./src/lib/db/schema.js";
import { v4 as uuidv4 } from 'uuid';

async function addDummyData() {
  const today = new Date();
  const prescriptionId = uuidv4();
  
  try {
    // Insert prescription with explicit UUID
    await db.insert(prescriptions).values({
      id: prescriptionId,
      title: "Sample Prescription",
      doctorName: "Dr. Smith",
      notes: "Take medications with water. Avoid heavy meals.",
      startDate: today,
      endDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    });

    console.log("Inserted prescription ID:", prescriptionId);

    // Prepare routines correctly
    const routine = [
      { dayOfWeek: 0, times: ["08:00", "20:00"], active: true },
      { dayOfWeek: 1, times: ["08:00", "20:00"], active: true },
      { dayOfWeek: 2, times: ["08:00", "20:00"], active: true },
      { dayOfWeek: 3, times: ["08:00", "20:00"], active: true },
      { dayOfWeek: 4, times: ["08:00", "20:00"], active: true },
      { dayOfWeek: 5, times: ["08:00", "20:00"], active: true },
      { dayOfWeek: 6, times: ["08:00", "20:00"], active: true },
    ];

    await db.insert(prescriptionMedications).values([
      {
        id: uuidv4(),
        prescriptionId: prescriptionId,
        name: "Amoxicillin",
        dosage: "500mg",
        routine: routine,
        notes: "Finish the full course."
      },
      {
        id: uuidv4(),
        prescriptionId: prescriptionId,
        name: "Ibuprofen",
        dosage: "200mg",
        routine: [{ dayOfWeek: today.getDay(), times: ["14:00"], active: true }],
        notes: "Take after food if needed for pain."
      }
    ]);

    console.log("Inserted medications for prescription.");
    process.exit(0);
  } catch (error) {
    console.error("Error inserting dummy data:", error);
    process.exit(1);
  }
}

addDummyData();
