"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Delete01Icon } from "@hugeicons/core-free-icons";
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

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

interface PrescriptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (prescription: Omit<Prescription, "id">) => void;
  initialPrescription?: Prescription;
  isLoading?: boolean;
}

function createEmptyMedication(): PrescriptionMedication {
  return {
    id: crypto.randomUUID(),
    name: "",
    dosage: "",
    routine: [],
    notes: "",
  };
}

export function PrescriptionForm({
  open,
  onOpenChange,
  onSave,
  initialPrescription,
  isLoading = false,
}: PrescriptionFormProps) {
  const [title, setTitle] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [medications, setMedications] = useState<PrescriptionMedication[]>([]);

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
      return;
    }

    setTitle("");
    setDoctorName("");
    setStartDate("");
    setEndDate("");
    setNotes("");
    setMedications([]);
  }, [initialPrescription, open]);

  const updateMedication = (
    index: number,
    updater: (current: PrescriptionMedication) => PrescriptionMedication,
  ) => {
    setMedications((current) =>
      current.map((medication, medicationIndex) =>
        medicationIndex === index ? updater(medication) : medication,
      ),
    );
  };

  const handleAddMedication = () => {
    setMedications((current) => [...current, createEmptyMedication()]);
  };

  const handleRemoveMedication = (index: number) => {
    setMedications((current) =>
      current.filter((_, medicationIndex) => medicationIndex !== index),
    );
  };

  const handleFieldChange = (
    index: number,
    field: keyof PrescriptionMedication,
    value: string | MedicationRoutine[],
  ) => {
    updateMedication(index, (current) => ({ ...current, [field]: value }));
  };

  const handleToggleDay = (medIndex: number, dayOfWeek: number) => {
    updateMedication(medIndex, (current) => {
      const exists = current.routine.some(
        (entry) => entry.dayOfWeek === dayOfWeek,
      );

      if (exists) {
        return {
          ...current,
          routine: current.routine.filter(
            (entry) => entry.dayOfWeek !== dayOfWeek,
          ),
        };
      }

      return {
        ...current,
        routine: [
          ...current.routine,
          { dayOfWeek, times: ["09:00"], active: true },
        ],
      };
    });
  };

  const handleUpdateRoutineTime = (
    medIndex: number,
    dayOfWeek: number,
    timeIndex: number,
    time: string,
  ) => {
    updateMedication(medIndex, (current) => ({
      ...current,
      routine: current.routine.map((entry) =>
        entry.dayOfWeek === dayOfWeek
          ? {
              ...entry,
              times: entry.times.map((entryTime, index) =>
                index === timeIndex ? time : entryTime,
              ),
            }
          : entry,
      ),
    }));
  };

  const handleAddRoutineTime = (medIndex: number, dayOfWeek: number) => {
    updateMedication(medIndex, (current) => ({
      ...current,
      routine: current.routine.map((entry) =>
        entry.dayOfWeek === dayOfWeek
          ? { ...entry, times: [...entry.times, "12:00"] }
          : entry,
      ),
    }));
  };

  const handleRemoveRoutineTime = (
    medIndex: number,
    dayOfWeek: number,
    timeIndex: number,
  ) => {
    updateMedication(medIndex, (current) => ({
      ...current,
      routine: current.routine.map((entry) =>
        entry.dayOfWeek === dayOfWeek
          ? {
              ...entry,
              times: entry.times.filter((_, index) => index !== timeIndex),
            }
          : entry,
      ),
    }));
  };

  const handleApplyTemplate = (
    medIndex: number,
    template: MedicationRoutine[],
  ) => {
    handleFieldChange(medIndex, "routine", template);
  };

  const handleSave = () => {
    if (!title || !startDate || medications.length === 0) {
      alert(
        "Please fill in title, start date, and add at least one medication",
      );
      return;
    }

    const invalidMedication = medications.some(
      (medication) => !medication.name || !medication.dosage,
    );

    if (invalidMedication) {
      alert("All medications must have a name and dosage");
      return;
    }

    onSave({
      title,
      doctorName: doctorName || undefined,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      notes: notes || undefined,
      medications: medications.map((medication) => ({
        ...medication,
        routine: [...medication.routine].sort(
          (a, b) => a.dayOfWeek - b.dayOfWeek,
        ),
      })),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden border border-border bg-background/80 p-0 shadow-lg supports-backdrop-filter:backdrop-blur-xl">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle className="text-lg font-semibold">
            {initialPrescription ? "Edit" : "Add"} Prescription
          </DialogTitle>
          <DialogDescription>
            Create a prescription with medications, dosage, and weekly schedule.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-10.5rem)] px-6 py-5">
          <div className="space-y-6 pb-2">
            <section className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Prescription Details
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Title *</Label>
                  <Input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g., Hypertension Management"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Doctor Name</Label>
                  <Input
                    value={doctorName}
                    onChange={(event) => setDoctorName(event.target.value)}
                    placeholder="e.g., Dr. Smith"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>End Date (Optional)</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Additional notes about this prescription..."
                />
              </div>
            </section>

            <section className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Medications
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMedication}
                >
                  <HugeiconsIcon icon={Add01Icon} className="h-3 w-3" />
                  Add Medication
                </Button>
              </div>

              {medications.length === 0 ? (
                <Card className="border border-border bg-card py-6 text-center shadow-none">
                  <p className="text-sm text-muted-foreground">
                    Add at least one medication to continue.
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {medications.map((medication, medIndex) => (
                    <Card
                      key={medication.id}
                      className="border border-border bg-card py-4 shadow-none"
                    >
                      <div className="space-y-4 px-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-foreground">
                            Medication {medIndex + 1}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleRemoveMedication(medIndex)}
                            aria-label="Remove medication"
                          >
                            <HugeiconsIcon icon={Delete01Icon} />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">
                              Name *
                            </Label>
                            <Input
                              value={medication.name}
                              onChange={(event) =>
                                handleFieldChange(
                                  medIndex,
                                  "name",
                                  event.target.value,
                                )
                              }
                              placeholder="e.g., Aspirin"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">
                              Dosage *
                            </Label>
                            <Input
                              value={medication.dosage}
                              onChange={(event) =>
                                handleFieldChange(
                                  medIndex,
                                  "dosage",
                                  event.target.value,
                                )
                              }
                              placeholder="e.g., 500mg, 1 tablet"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">
                            Notes
                          </Label>
                          <Input
                            value={medication.notes || ""}
                            onChange={(event) =>
                              handleFieldChange(
                                medIndex,
                                "notes",
                                event.target.value,
                              )
                            }
                            placeholder="Take with food, etc."
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <Label className="text-xs text-muted-foreground">
                              Schedule
                            </Label>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-6 text-[10px]"
                                onClick={() =>
                                  handleApplyTemplate(
                                    medIndex,
                                    MEDICATION_TEMPLATES.onceDailyMorning(),
                                  )
                                }
                              >
                                Once Daily
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-6 text-[10px]"
                                onClick={() =>
                                  handleApplyTemplate(
                                    medIndex,
                                    MEDICATION_TEMPLATES.twiceDailyMorningEvening(),
                                  )
                                }
                              >
                                Twice Daily
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            {DAYS_SHORT.map((day, dayIndex) => {
                              const dayRoutine = medication.routine.find(
                                (entry) => entry.dayOfWeek === dayIndex,
                              );

                              return (
                                <div
                                  key={day}
                                  className={cn(
                                    "rounded-md border p-2",
                                    dayRoutine
                                      ? "border-primary bg-primary/5"
                                      : "border-border bg-muted/30",
                                  )}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleToggleDay(medIndex, dayIndex)
                                    }
                                    className="flex w-full items-center justify-between text-left"
                                  >
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
                                      <div className="flex flex-wrap gap-1">
                                        {dayRoutine.times.map((time, index) => (
                                          <Badge
                                            key={`${day}-${index}`}
                                            variant="secondary"
                                            className="text-[10px]"
                                          >
                                            {time}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </button>

                                  {dayRoutine && (
                                    <div className="mt-2 space-y-1">
                                      {dayRoutine.times.map(
                                        (time, timeIndex) => (
                                          <div
                                            key={`${day}-${timeIndex}`}
                                            className="flex items-center gap-2"
                                          >
                                            <Input
                                              type="time"
                                              value={time}
                                              className="h-7 text-xs"
                                              onChange={(event) =>
                                                handleUpdateRoutineTime(
                                                  medIndex,
                                                  dayIndex,
                                                  timeIndex,
                                                  event.target.value,
                                                )
                                              }
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
                                              aria-label="Remove time"
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
                                        className="h-6 w-full text-[10px]"
                                        onClick={() =>
                                          handleAddRoutineTime(
                                            medIndex,
                                            dayIndex,
                                          )
                                        }
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
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t border-border bg-background/70 px-6 py-4">
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
