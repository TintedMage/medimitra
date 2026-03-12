"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CancelCircleIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Medication, MedicationRoutine } from "@/lib/store";
import { MEDICATION_TEMPLATES } from "@/lib/medications";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

interface MedicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (medication: Omit<Medication, "id">) => void;
  initialMedication?: Medication;
}

export function MedicationForm({
  open,
  onOpenChange,
  onSave,
  initialMedication,
}: MedicationFormProps) {
  const [name, setName] = useState(initialMedication?.name || "");
  const [dosage, setDosage] = useState(initialMedication?.dosage || "");
  const [startDate, setStartDate] = useState(
    initialMedication?.startDate.toISOString().split("T")[0] || ""
  );
  const [endDate, setEndDate] = useState(
    initialMedication?.endDate?.toISOString().split("T")[0] || ""
  );
  const [routine, setRoutine] = useState<MedicationRoutine[]>(
    initialMedication?.routine || []
  );

  const handleAddDay = (dayOfWeek: number) => {
    const existing = routine.find((r) => r.dayOfWeek === dayOfWeek);
    if (existing) {
      setRoutine(routine.filter((r) => r.dayOfWeek !== dayOfWeek));
    } else {
      setRoutine([
        ...routine,
        { dayOfWeek, times: ["09:00"], active: true },
      ]);
    }
  };

  const handleTimeChange = (dayOfWeek: number, timeIndex: number, time: string) => {
    setRoutine(
      routine.map((r) =>
        r.dayOfWeek === dayOfWeek
          ? {
              ...r,
              times: r.times.map((t, idx) => (idx === timeIndex ? time : t)),
            }
          : r
      )
    );
  };

  const handleAddTime = (dayOfWeek: number) => {
    setRoutine(
      routine.map((r) =>
        r.dayOfWeek === dayOfWeek
          ? { ...r, times: [...r.times, "12:00"] }
          : r
      )
    );
  };

  const handleRemoveTime = (dayOfWeek: number, timeIndex: number) => {
    setRoutine(
      routine.map((r) =>
        r.dayOfWeek === dayOfWeek
          ? { ...r, times: r.times.filter((_, idx) => idx !== timeIndex) }
          : r
      )
    );
  };

  const handleSave = () => {
    if (!name || !dosage || !startDate) {
      alert("Please fill in all required fields");
      return;
    }

    onSave({
      name,
      dosage,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      routine: routine.sort((a, b) => a.dayOfWeek - b.dayOfWeek),
    });

    // Reset form
    setName("");
    setDosage("");
    setStartDate("");
    setEndDate("");
    setRoutine([]);
    onOpenChange(false);
  };

  const handleApplyTemplate = (template: MedicationRoutine[]) => {
    setRoutine(template);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {initialMedication ? "Edit" : "Add"} Medication
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onOpenChange(false)}
          >
            <HugeiconsIcon icon={CancelCircleIcon} />
          </Button>
        </div>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-5">
            {/* Basic Info */}
            <div>
              <Label className="text-sm text-foreground">Medication Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Aspirin, Metformin"
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm text-foreground">Dosage *</Label>
              <Input
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g., 500mg, 1 tablet"
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-foreground">Start Date *</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-foreground">End Date (Optional)</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <Separator />

            {/* Daily Routine */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <Label className="text-sm font-semibold text-foreground">
                  Daily Routine
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleApplyTemplate(
                        MEDICATION_TEMPLATES.onceDailyMorning()
                      )
                    }
                    className="h-8 text-xs"
                  >
                    Once Daily
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleApplyTemplate(
                        MEDICATION_TEMPLATES.twiceDailyMorningEvening()
                      )
                    }
                    className="h-8 text-xs"
                  >
                    Twice Daily
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {DAYS.map((day, idx) => {
                  const dayRoutine = routine.find((r) => r.dayOfWeek === idx);
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "rounded-md border p-3 transition-colors",
                        dayRoutine
                          ? "border-primary bg-primary/5"
                          : "border-border bg-muted/30"
                      )}
                    >
                      <button
                        onClick={() => handleAddDay(idx)}
                        className="w-full text-left"
                      >
                        <p
                          className={cn(
                            "text-sm font-medium transition-colors",
                            dayRoutine
                              ? "text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {day}
                          {dayRoutine && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              {dayRoutine.times.join(", ")}
                            </span>
                          )}
                        </p>
                      </button>

                      {dayRoutine && (
                        <div className="mt-3 space-y-2 pl-2">
                          {dayRoutine.times.map((time, timeIdx) => (
                            <div key={timeIdx} className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={time}
                                onChange={(e) =>
                                  handleTimeChange(idx, timeIdx, e.target.value)
                                }
                                className="h-8 text-xs"
                              />
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => handleRemoveTime(idx, timeIdx)}
                              >
                                <HugeiconsIcon icon={CancelCircleIcon} />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddTime(idx)}
                            className="h-8 w-full text-xs"
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
        </ScrollArea>

        {/* Footer */}
        <div className="mt-6 flex gap-3 border-t border-border pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Medication
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
