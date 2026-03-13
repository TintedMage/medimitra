"use client";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar01Icon,
  Clock01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Edit02Icon,
  Add01Icon,
  Delete01Icon,
  PillIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useChatStore, Prescription } from "@/lib/store";
import { PrescriptionForm } from "./prescription-form";
import { getPrescriptionsForDay } from "@/lib/medications";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

export function CalendarPanel() {
  const {
    selectedDate,
    setSelectedDate,
    calendarOpen,
    prescriptions,
    setPrescriptions,
  } = useChatStore();

  // Calendar state
  const [month, setMonth] = useState(2); // 0-indexed, 2 = March
  const [year, setYear] = useState(2026);
  const dates = Array.from(
    { length: new Date(year, month + 1, 0).getDate() },
    (_, i) => i + 1,
  );
  const currentDate = new Date(year, month, selectedDate);
  const dayOfWeek = currentDate.getDay();

  // Month/year switcher
  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const YEARS = Array.from({ length: 11 }, (_, i) => 2021 + i); // 2021-2031

  // Get prescriptions for the selected day
  const selectedDayPrescriptions = getPrescriptionsForDay(
    prescriptions,
    dayOfWeek,
  );

  // Load prescriptions on mount
  useEffect(() => {
    const loadPrescriptions = async () => {
      try {
        const res = await fetch("/api/prescriptions");
        if (res.ok) {
          const data = await res.json();
          const parsedData = data.map((prescription: any) => ({
            ...prescription,
            startDate: new Date(prescription.startDate),
            endDate: prescription.endDate
              ? new Date(prescription.endDate)
              : undefined,
            medications: prescription.medications.map((med: any) => ({
              ...med,
              routine:
                typeof med.routine === "string"
                  ? JSON.parse(med.routine)
                  : med.routine,
            })),
          }));
          setPrescriptions(parsedData);
        }
      } catch (error) {
        console.error("Failed to load prescriptions:", error);
      }
    };

    loadPrescriptions();
  }, [setPrescriptions]);

  if (!calendarOpen) return null;

  return (
    <>
      <aside className="flex w-80 shrink-0 flex-col border-l border-border bg-sidebar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-sidebar-foreground">
            <HugeiconsIcon icon={Calendar01Icon} className="text-primary" />
            Schedule
          </h2>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                if (month === 0) {
                  setMonth(11);
                  setYear((y) => y - 1);
                } else {
                  setMonth((m) => m - 1);
                }
              }}
              aria-label="Previous month"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                if (month === 11) {
                  setMonth(0);
                  setYear((y) => y + 1);
                } else {
                  setMonth((m) => m + 1);
                }
              }}
              aria-label="Next month"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} />
            </Button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="p-4">
          <div className="mb-4 flex justify-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 py-1 text-xs font-medium text-muted-foreground"
                    aria-label="Change month"
                  >
                    {MONTHS[month]}
                  </Button>
                }
              />
              <DropdownMenuContent align="center" className="w-32 p-0">
                <div className="max-h-48 overflow-y-auto">
                  {MONTHS.map((m, idx) => (
                    <DropdownMenuItem
                      key={m}
                      onClick={() => setMonth(idx)}
                      className={cn(
                        "text-xs",
                        month === idx && "bg-accent text-accent-foreground",
                      )}
                    >
                      {m}
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 py-1 text-xs font-medium text-muted-foreground"
                    aria-label="Change year"
                  >
                    {year}
                  </Button>
                }
              />
              <DropdownMenuContent align="center" className="w-24 p-0">
                <div className="max-h-48 overflow-y-auto">
                  {YEARS.map((y) => (
                    <DropdownMenuItem
                      key={y}
                      onClick={() => setYear(y)}
                      className={cn(
                        "text-xs",
                        year === y && "bg-accent text-accent-foreground",
                      )}
                    >
                      {y}
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="mb-2 grid grid-cols-7 gap-1 text-center">
            {DAYS.map((day) => (
              <span
                key={day}
                className="text-[10px] font-bold uppercase text-muted-foreground"
              >
                {day}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {dates.map((date) => {
              const dateObj = new Date(year, month, date);
              const dayOfWeekForDate = dateObj.getDay();
              const hasPrescriptions =
                getPrescriptionsForDay(prescriptions, dayOfWeekForDate).length >
                0;

              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "relative flex h-8 items-center justify-center rounded-md text-xs transition-colors",
                    selectedDate === date
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  {date}
                  {hasPrescriptions && selectedDate !== date && (
                    <div className="absolute bottom-0 right-0 h-1 w-1 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Prescriptions Section */}
        <ScrollArea className="flex-1 p-4">
          <div className="mb-4 flex items-center">
            <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground">
              <HugeiconsIcon icon={Clock01Icon} />
              Prescriptions for {MONTHS[month]} {selectedDate}
            </h3>
          </div>

          {selectedDayPrescriptions.length === 0 ? (
            <Card className="p-4">
              <div className="text-center">
                <HugeiconsIcon
                  icon={PillIcon}
                  className="mx-auto mb-2 h-8 w-8 text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  No prescriptions scheduled for today
                </p>
              </div>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {selectedDayPrescriptions.map(({ prescription, medications }) => (
                <Card key={prescription.id} className="p-3">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground">
                        {prescription.title}
                      </h4>
                      {prescription.doctorName && (
                        <p className="text-xs text-muted-foreground">
                          {prescription.doctorName}
                        </p>
                      )}
                      <div className="mt-3 flex gap-1">
                        <Badge variant="outline" className="text-[10px]">
                          {medications.length} med
                          {medications.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-2">
                    {medications.map(({ medication, times }) => (
                      <div
                        key={medication.id}
                        className="rounded border border-primary/20 bg-primary/5 p-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-primary">
                              {medication.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {medication.dosage}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {times.map((time, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-[9px]"
                              >
                                {time}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {medication.notes && (
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            {medication.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {prescription.notes && (
                    <div className="mt-2 rounded border-l-2 border-muted-foreground/30 bg-muted/30 p-2">
                      <p className="text-[10px] text-muted-foreground">
                        {prescription.notes}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </aside>
    </>
  );
}
