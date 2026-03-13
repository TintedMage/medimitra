import { Medication, MedicationRoutine, Prescription, PrescriptionMedication } from "@/lib/store";

/**
 * Standardized JSON structure for Prescriptions (for AI tool integration)
 * This is used to generate and parse prescription data without relying on AI SDK tools
 */
export type PrescriptionJSON = {
  id: string;
  title: string;
  doctorName?: string;
  startDate: string; // ISO 8601
  endDate?: string; // ISO 8601
  notes?: string;
  medications: Array<{
    id?: string;
    name: string;
    dosage: string;
    routine: Array<{
      dayOfWeek: number; // 0-6
      times: string[]; // ["09:00", "18:00"]
      active: boolean;
    }>;
    notes?: string;
  }>;
};

/**
 * Legacy Medication JSON for backward compatibility
 */
export type MedicationJSON = {
  id: string;
  name: string;
  dosage: string;
  startDate: string; // ISO 8601
  endDate?: string; // ISO 8601
  routine: Array<{
    dayOfWeek: number; // 0-6
    times: string[]; // ["09:00", "18:00"]
    active: boolean;
  }>;
};

/**
 * Convert Prescription object to JSON format
 */
export function toPrescriptionJSON(prescription: Prescription): PrescriptionJSON {
  return {
    id: prescription.id,
    title: prescription.title,
    doctorName: prescription.doctorName,
    startDate: prescription.startDate.toISOString(),
    endDate: prescription.endDate?.toISOString(),
    notes: prescription.notes,
    medications: prescription.medications.map(med => ({
      id: med.id,
      name: med.name,
      dosage: med.dosage,
      routine: med.routine,
      notes: med.notes,
    })),
  };
}

/**
 * Convert JSON to Prescription object
 */
export function fromPrescriptionJSON(json: PrescriptionJSON): Prescription {
  return {
    id: json.id,
    title: json.title,
    doctorName: json.doctorName,
    startDate: new Date(json.startDate),
    endDate: json.endDate ? new Date(json.endDate) : undefined,
    notes: json.notes,
    medications: json.medications.map(med => ({
      id: med.id || crypto.randomUUID(),
      name: med.name,
      dosage: med.dosage,
      routine: med.routine,
      notes: med.notes,
    })),
  };
}

/**
 * Convert Medication object to JSON format (legacy)
 */
export function toMedicationJSON(med: Medication): MedicationJSON {
  return {
    id: med.id,
    name: med.name,
    dosage: med.dosage,
    startDate: med.startDate.toISOString(),
    endDate: med.endDate?.toISOString(),
    routine: med.routine,
  };
}

/**
 * Convert JSON to Medication object (legacy)
 */
export function fromMedicationJSON(json: MedicationJSON): Medication {
  return {
    id: json.id,
    name: json.name,
    dosage: json.dosage,
    startDate: new Date(json.startDate),
    endDate: json.endDate ? new Date(json.endDate) : undefined,
    routine: json.routine,
  };
}

/**
 * Generate a medication routine for a specific day
 */
export function generateDailyRoutine(
  dayOfWeek: number,
  times: string[],
  active: boolean = true
): MedicationRoutine {
  return {
    dayOfWeek,
    times,
    active,
  };
}

/**
 * Get prescriptions with medications scheduled for a specific date (day of week)
 */
export function getPrescriptionsForDay(
  prescriptions: Prescription[],
  dayOfWeek: number
): Array<{
  prescription: Prescription;
  medications: Array<{
    medication: PrescriptionMedication;
    times: string[];
  }>;
}> {
  return prescriptions
    .map(prescription => {
      const now = new Date();
      const startTime = prescription.startDate.getTime();
      const endTime = prescription.endDate?.getTime();
      
      // Check if prescription is currently active
      const isActive = now.getTime() >= startTime && (!endTime || now.getTime() <= endTime);
      if (!isActive) return null;

      // Get medications active for this day
      const activeMedications = prescription.medications
        .filter(med => {
          return med.routine.some(r => r.dayOfWeek === dayOfWeek && r.active);
        })
        .map(med => ({
          medication: med,
          times: med.routine
            .filter(r => r.dayOfWeek === dayOfWeek && r.active)
            .flatMap(r => r.times),
        }));

      return activeMedications.length > 0 ? {
        prescription,
        medications: activeMedications,
      } : null;
    })
    .filter(Boolean) as Array<{
      prescription: Prescription;
      medications: Array<{
        medication: PrescriptionMedication;
        times: string[];
      }>;
    }>;
}

/**
 * Get medications scheduled for a specific date (day of week) - Legacy function
 */
export function getMedicationsForDay(
  medications: Medication[],
  dayOfWeek: number
): Array<{
  medication: Medication;
  times: string[];
}> {
  return medications
    .filter((med) => {
      const hasActiveRoutine = med.routine.some(
        (r) => r.dayOfWeek === dayOfWeek && r.active
      );
      return hasActiveRoutine;
    })
    .map((med) => ({
      medication: med,
      times: med.routine
        .filter((r) => r.dayOfWeek === dayOfWeek && r.active)
        .flatMap((r) => r.times),
    }));
}

/**
 * Check if a prescription is active on a specific date
 */
export function isPrescriptionActive(prescription: Prescription, date: Date): boolean {
  const now = date.getTime();
  const startTime = prescription.startDate.getTime();
  const endTime = prescription.endDate?.getTime();

  if (now < startTime) return false;
  if (endTime && now > endTime) return false;
  return true;
}

/**
 * Check if a medication is active on a specific date (legacy)
 */
export function isMedicationActive(med: Medication, date: Date): boolean {
  const now = date.getTime();
  const startTime = med.startDate.getTime();
  const endTime = med.endDate?.getTime();

  if (now < startTime) return false;
  if (endTime && now > endTime) return false;
  return true;
}

/**
 * Predefined medication templates for common use cases
 */
export const MEDICATION_TEMPLATES = {
  twiceDailyMorningEvening: (dayOfWeek: number = 0): MedicationRoutine[] => [
    { dayOfWeek, times: ["09:00", "18:00"], active: true },
  ],
  thriceDaily: (dayOfWeek: number = 0): MedicationRoutine[] => [
    { dayOfWeek, times: ["08:00", "14:00", "20:00"], active: true },
  ],
  onceDailyMorning: (dayOfWeek: number = 0): MedicationRoutine[] => [
    { dayOfWeek, times: ["09:00"], active: true },
  ],
  weekdaysOnly: (times: string[] = ["09:00"]): MedicationRoutine[] => [
    { dayOfWeek: 1, times, active: true },
    { dayOfWeek: 2, times, active: true },
    { dayOfWeek: 3, times, active: true },
    { dayOfWeek: 4, times, active: true },
    { dayOfWeek: 5, times, active: true },
  ],
  everyDay: (times: string[] = ["09:00"]): MedicationRoutine[] => [
    { dayOfWeek: 0, times, active: true },
    { dayOfWeek: 1, times, active: true },
    { dayOfWeek: 2, times, active: true },
    { dayOfWeek: 3, times, active: true },
    { dayOfWeek: 4, times, active: true },
    { dayOfWeek: 5, times, active: true },
    { dayOfWeek: 6, times, active: true },
  ],
};
