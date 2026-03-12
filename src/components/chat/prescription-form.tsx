"use client";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CancelCircleIcon,
  Add01Icon,
  Delete01Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Prescription,
  PrescriptionMedication,
  MedicationRoutine,
} from "@/lib/store";
import { MEDICATION_TEMPLATES } from "@/lib/medications";
import { cn } from "@/lib/utils";

const DAYS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

interface PrescriptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (prescription: Omit<Prescription, "id">) => void;
  initialPrescription?: Prescription;
  isLoading?: boolean;
}

export function PrescriptionForm({
  open,
  onOpenChange,
  onSave,
  initialPrescription,
  isLoading = false,
}: PrescriptionFormProps) {
  const [title, setTitle] = useState(initialPrescription?.title || "");
  const [doctorName, setDoctorName] = useState(
    initialPrescription?.doctorName || "",
  );
  const [startDate, setStartDate] = useState(
    initialPrescription?.startDate.toISOString().split("T")[0] || "",
  );
  const [endDate, setEndDate] = useState(
    initialPrescription?.endDate?.toISOString().split("T")[0] || "",
  );
  const [notes, setNotes] = useState(initialPrescription?.notes || "");
  const [medications, setMedications] = useState<PrescriptionMedication[]>(
    initialPrescription?.medications || [],
  );

  // Reset form when initial prescription changes
  useEffect(() => {
    if (initialPrescription) {
      setTitle(initialPrescription.title);
      setDoctorName(initialPrescription.doctorName || "");
      setStartDate(initialPrescription.startDate.toISOString().split("T")[0]);
      setEndDate(
        initialPrescription.endDate?.toISOString().split("T")[0] || "",
      );
      setNotes(initialPrescription.notes || "");
      setMedications(initialPrescription.medications);
    } else {
      // Reset for new prescription
      setTitle("");
      setDoctorName("");
      setStartDate("");
      setEndDate("");
      setNotes("");
      setMedications([]);
    }
  }, [initialPrescription]);

  const handleAddMedication = () => {
    const newMed: PrescriptionMedication = {
      id: crypto.randomUUID(),
      name: "",
      dosage: "",
      routine: [],
      notes: "",
    };
    setMedications([...medications, newMed]);
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleUpdateMedication = (
    index: number,
    field: keyof PrescriptionMedication,
    value: any,
  ) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const handleAddRoutineDay = (medIndex: number, dayOfWeek: number) => {
    const medication = medications[medIndex];
    const existing = medication.routine.find((r) => r.dayOfWeek === dayOfWeek);

    if (existing) {
      const newRoutine = medication.routine.filter(
        (r) => r.dayOfWeek !== dayOfWeek,
      );
      handleUpdateMedication(medIndex, "routine", newRoutine);
    } else {
      const newRoutine = [
        ...medication.routine,
        { dayOfWeek, times: ["09:00"], active: true },
      ];
      handleUpdateMedication(medIndex, "routine", newRoutine);
    }
  };

  const handleUpdateRoutineTime = (
    medIndex: number,
    dayOfWeek: number,
    timeIndex: number,
    time: string,
  ) => {
    const medication = medications[medIndex];
    const newRoutine = medication.routine.map((r) =>
      r.dayOfWeek === dayOfWeek
        ? {
            ...r,
            times: r.times.map((t, idx) => (idx === timeIndex ? time : t)),
          }
        : r,
    );
    handleUpdateMedication(medIndex, "routine", newRoutine);
  };

  const handleAddRoutineTime = (medIndex: number, dayOfWeek: number) => {
    const medication = medications[medIndex];
    const newRoutine = medication.routine.map((r) =>
      r.dayOfWeek === dayOfWeek ? { ...r, times: [...r.times, "12:00"] } : r,
    );
    handleUpdateMedication(medIndex, "routine", newRoutine);
  };

  const handleRemoveRoutineTime = (
    medIndex: number,
    dayOfWeek: number,
    timeIndex: number,
  ) => {
    const medication = medications[medIndex];
    const newRoutine = medication.routine.map((r) =>
      r.dayOfWeek === dayOfWeek
        ? { ...r, times: r.times.filter((_, idx) => idx !== timeIndex) }
        : r,
    );
    handleUpdateMedication(medIndex, "routine", newRoutine);
  };

  const handleApplyTemplate = (
    medIndex: number,
    template: MedicationRoutine[],
  ) => {
    handleUpdateMedication(medIndex, "routine", template);
  };

  const handleSave = () => {
    if (!title || !startDate || medications.length === 0) {
      alert(
        "Please fill in title, start date, and add at least one medication",
      );
      return;
    }

    // Validate medications
    for (const med of medications) {
      if (!med.name || !med.dosage) {
        alert("All medications must have a name and dosage");
        return;
      }
    }

    onSave({
      title,
      doctorName: doctorName || undefined,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      notes: notes || undefined,
      medications: medications.map((med) => ({
        ...med,
        routine: med.routine.sort((a, b) => a.dayOfWeek - b.dayOfWeek),
      })),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {initialPrescription ? "Edit" : "Add"} Prescription
          </DialogTitle>
          <DialogDescription>
            Create a prescription with multiple medications and their schedules.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Prescription Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                Prescription Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-foreground">Title *</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Cough Treatment, Hypertension Management"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm text-foreground">Doctor Name</Label>
                  <Input
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g., Dr. Smith"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-foreground">
                    Start Date *
                  </Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm text-foreground">
                    End Date (Optional)
                  </Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm text-foreground">Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes about this prescription..."
                  className="mt-1"
                />
              </div>
            </div>

            <Separator />

            {/* Medications */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Medications
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMedication}
                >
                  <HugeiconsIcon icon={Add01Icon} className="mr-1 h-3 w-3" />
                  Add Medication
                </Button>
              </div>

              {medications.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No medications added yet. Click "Add Medication" to start.
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {medications.map((medication, medIndex) => (
                    <Card key={medication.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium text-foreground">
                            Medication {medIndex + 1}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleRemoveMedication(medIndex)}
                          >
                            <HugeiconsIcon icon={Delete01Icon} />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Name *
                            </Label>
                            <Input
                              value={medication.name}
                              onChange={(e) =>
                                handleUpdateMedication(
                                  medIndex,
                                  "name",
                                  e.target.value,
                                )
                              }
                              placeholder="e.g., Aspirin, Metformin"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Dosage *
                            </Label>
                            <Input
                              value={medication.dosage}
                              onChange={(e) =>
                                handleUpdateMedication(
                                  medIndex,
                                  "dosage",
                                  e.target.value,
                                )
                              }
                              placeholder="e.g., 500mg, 1 tablet"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Notes
                          </Label>
                          <Input
                            value={medication.notes || ""}
                            onChange={(e) =>
                              handleUpdateMedication(
                                medIndex,
                                "notes",
                                e.target.value,
                              )
                            }
                            placeholder="Take with food, etc."
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground">
                              Schedule
                            </Label>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleApplyTemplate(
                                    medIndex,
                                    MEDICATION_TEMPLATES.onceDailyMorning(),
                                  )
                                }
                                className="h-6 text-[10px]"
                              >
                                Once Daily
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleApplyTemplate(
                                    medIndex,
                                    MEDICATION_TEMPLATES.twiceDailyMorningEvening(),
                                  )
                                }
                                className="h-6 text-[10px]"
                              >
                                Twice Daily
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            {DAYS_SHORT.map((day, dayIndex) => {
                              const dayRoutine = medication.routine.find(
                                (r) => r.dayOfWeek === dayIndex,
                              );
                              return (
                                <div
                                  key={dayIndex}
                                  className={cn(
                                    "rounded border p-2 transition-colors",
                                    dayRoutine
                                      ? "border-primary bg-primary/5"
                                      : "border-border bg-muted/30",
                                  )}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAddRoutineDay(medIndex, dayIndex)
                                    }
                                    className="w-full text-left"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span
                                        className={cn(
                                          "text-xs font-medium",
                                          dayRoutine
                                            ? "text-primary"
                                            : "text-muted-foreground",
                                        )}
                                      >
                                        {day}
                                      </span>
                                      {dayRoutine && (
                                        <div className="flex gap-1">
                                          {dayRoutine.times.map((time, idx) => (
                                            <Badge
                                              key={idx}
                                              variant="secondary"
                                              className="text-[10px]"
                                            >
                                              {time}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </button>

                                  {dayRoutine && (
                                    <div className="mt-2 space-y-1 pl-2">
                                      {dayRoutine.times.map(
                                        (time, timeIndex) => (
                                          <div
                                            key={timeIndex}
                                            className="flex items-center gap-2"
                                          >
                                            <Input
                                              type="time"
                                              value={time}
                                              onChange={(e) =>
                                                handleUpdateRoutineTime(
                                                  medIndex,
                                                  dayIndex,
                                                  timeIndex,
                                                  e.target.value,
                                                )
                                              }
                                              className="h-6 text-xs"
                                            />
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon-xs"
                                              onClick={() =>
                                                handleRemoveRoutineTime(
                                                  medIndex,
                                                  dayIndex,
                                                  timeIndex,
                                                )
                                              }
                                            >
                                              <HugeiconsIcon
                                                icon={Delete01Icon}
                                              />
                                            </Button>
                                          </div>
                                        ),
                                      )}
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleAddRoutineTime(
                                            medIndex,
                                            dayIndex,
                                          )
                                        }
                                        className="h-6 w-full text-[10px]"
                                      >
                                        + Add Time
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Prescription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
