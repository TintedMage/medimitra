"use client";

import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Clock01Icon,
  Delete01Icon,
  PillIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PrescriptionForm } from "@/components/chat/prescription-form";
import { Prescription as StorePrescription } from "@/lib/store";
import { cn } from "@/lib/utils";

type RoutineEntry = {
  dayOfWeek: number;
  times: string[];
  active: boolean;
};

type PrescriptionMedication = {
  id: string;
  name: string;
  dosage: string;
  routine: RoutineEntry[];
  notes?: string | null;
};

type Prescription = {
  id: string;
  title: string;
  doctorName?: string | null;
  startDate: string;
  endDate?: string | null;
  notes?: string | null;
  medications: PrescriptionMedication[];
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDate(dateString?: string | null) {
  if (!dateString) return "Ongoing";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [openCardIds, setOpenCardIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSavingPrescription, setIsSavingPrescription] = useState(false);
  const [deletingPrescriptionId, setDeletingPrescriptionId] = useState<
    string | null
  >(null);

  useEffect(() => {
    const loadPrescriptions = async () => {
      try {
        const response = await fetch("/api/prescriptions");
        if (!response.ok) {
          throw new Error("Failed to load prescriptions");
        }

        const data = await response.json();
        const normalized = (data as Prescription[]).map((prescription) => ({
          ...prescription,
          medications: prescription.medications.map((medication) => ({
            ...medication,
            routine:
              typeof medication.routine === "string"
                ? JSON.parse(medication.routine)
                : medication.routine,
          })),
        }));

        setPrescriptions(normalized);
      } catch {
        setPrescriptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrescriptions();
  }, []);

  const sortedPrescriptions = useMemo(
    () =>
      [...prescriptions].sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      ),
    [prescriptions],
  );

  const toggleCard = (id: string) => {
    setOpenCardIds((current) =>
      current.includes(id)
        ? current.filter((cardId) => cardId !== id)
        : [...current, id],
    );
  };

  const handleCreatePrescription = async (
    prescription: Omit<StorePrescription, "id">,
  ) => {
    try {
      setIsSavingPrescription(true);

      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: prescription.title,
          doctorName: prescription.doctorName,
          startDate: prescription.startDate.toISOString().split("T")[0],
          endDate: prescription.endDate
            ? prescription.endDate.toISOString().split("T")[0]
            : undefined,
          notes: prescription.notes,
          medications: prescription.medications.map((medication) => ({
            name: medication.name,
            dosage: medication.dosage,
            routine: medication.routine,
            notes: medication.notes,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create prescription");
      }

      const created = (await response.json()) as Prescription;
      setPrescriptions((current) => [created, ...current]);
      setIsFormOpen(false);
    } catch {
      alert("Could not create prescription. Please try again.");
    } finally {
      setIsSavingPrescription(false);
    }
  };

  const handleDeletePrescription = async (id: string) => {
    try {
      setDeletingPrescriptionId(id);
      const response = await fetch(`/api/prescriptions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete prescription");
      }

      setPrescriptions((current) =>
        current.filter((prescription) => prescription.id !== id),
      );
      setOpenCardIds((current) => current.filter((cardId) => cardId !== id));
    } catch {
      alert("Could not delete prescription. Please try again.");
    } finally {
      setDeletingPrescriptionId(null);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 pt-14 pb-8 md:px-8">
      <div className="mx-auto w-full max-w-4xl pt-14">
        <div className="mb-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={PillIcon} className="text-primary" />
            <h1 className="text-xl font-semibold text-foreground">
              Prescriptions
            </h1>
          </div>
          <Button size="sm" onClick={() => setIsFormOpen(true)}>
            <HugeiconsIcon icon={Add01Icon} />
            Add Prescription
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="text-sm text-muted-foreground">
              Loading prescriptions...
            </CardContent>
          </Card>
        ) : sortedPrescriptions.length === 0 ? (
          <Card>
            <CardContent className="text-sm text-muted-foreground">
              No prescriptions found.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedPrescriptions.map((prescription) => {
              const isOpen = openCardIds.includes(prescription.id);
              return (
                <Card key={prescription.id} className="py-0">
                  <div className="flex items-start gap-2 px-6 pt-4">
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => toggleCard(prescription.id)}
                    >
                      <CardHeader className="border-b px-0 pb-3">
                        <CardTitle className="flex items-center justify-between gap-4">
                          <span>{prescription.title}</span>
                          <Badge variant="outline">
                            {prescription.medications.length} med
                            {prescription.medications.length !== 1 ? "s" : ""}
                          </Badge>
                        </CardTitle>
                        <div className="text-xs text-muted-foreground">
                          {prescription.doctorName || "Doctor not specified"}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <HugeiconsIcon
                            icon={Clock01Icon}
                            className="size-3"
                          />
                          <span>
                            {formatDate(prescription.startDate)} -{" "}
                            {formatDate(prescription.endDate)}
                          </span>
                        </div>
                      </CardHeader>
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeletePrescription(prescription.id)}
                      disabled={deletingPrescriptionId === prescription.id}
                      aria-label="Delete prescription"
                    >
                      <HugeiconsIcon icon={Delete01Icon} />
                    </Button>
                  </div>

                  <CardContent className={cn("pt-4 pb-4", !isOpen && "hidden")}>
                    <div className="space-y-3 rounded-lg bg-muted/30 p-3">
                      {prescription.medications.map((medication) => (
                        <div
                          key={medication.id}
                          className="rounded-lg border border-border bg-card p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-foreground">
                              {medication.name}
                            </p>
                            <Badge variant="secondary">
                              {medication.dosage}
                            </Badge>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-1">
                            {medication.routine
                              .filter((entry) => entry.active)
                              .map((entry, index) => (
                                <Badge
                                  key={`${medication.id}-${index}`}
                                  variant="outline"
                                >
                                  {DAYS[entry.dayOfWeek]}:{" "}
                                  {entry.times.join(", ")}
                                </Badge>
                              ))}
                          </div>

                          {medication.notes && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              {medication.notes}
                            </p>
                          )}
                        </div>
                      ))}

                      {prescription.notes && (
                        <div className="rounded-lg border border-border bg-muted p-3 text-xs text-muted-foreground">
                          {prescription.notes}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <PrescriptionForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleCreatePrescription}
        isLoading={isSavingPrescription}
      />
    </main>
  );
}
