"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar01Icon,
  Clock01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useChatStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

const ROUTINES: Record<number | "default", { time: string; task: string }[]> = {
  12: [
    { time: "09:00 AM", task: "Morning check-in" },
    { time: "11:30 AM", task: "Medication reminder" },
    { time: "02:00 PM", task: "Doctor appointment" },
  ],
  default: [
    { time: "10:00 AM", task: "Health journal entry" },
    { time: "01:00 PM", task: "Midday wellness check" },
    { time: "04:00 PM", task: "Exercise routine" },
  ],
};

export function CalendarPanel() {
  const { selectedDate, setSelectedDate, calendarOpen } = useChatStore();
  const dates = Array.from({ length: 31 }, (_, i) => i + 1);
  const currentRoutine = ROUTINES[selectedDate] ?? ROUTINES.default;

  if (!calendarOpen) return null;

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-border bg-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-sidebar-foreground">
          <HugeiconsIcon icon={Calendar01Icon} className="text-primary" />
          Schedule
        </h2>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-xs">
            <HugeiconsIcon icon={ArrowLeft01Icon} />
          </Button>
          <Button variant="ghost" size="icon-xs">
            <HugeiconsIcon icon={ArrowRight01Icon} />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="p-4">
        <p className="mb-4 text-center text-xs font-medium text-muted-foreground">
          March 2026
        </p>
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
          {dates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={cn(
                "flex h-8 items-center justify-center rounded-md text-xs transition-colors",
                selectedDate === date
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {date}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Routine */}
      <ScrollArea className="flex-1 p-4">
        <h3 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground">
          <HugeiconsIcon icon={Clock01Icon} />
          Routine for March {selectedDate}
        </h3>
        <div className="flex flex-col gap-4">
          {currentRoutine.map((item, idx) => (
            <div key={idx} className="relative border-l border-primary/30 pl-4">
              <div className="absolute -left-[4.5px] top-1 size-2 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
              <p className="text-[10px] font-medium text-primary">
                {item.time}
              </p>
              <p className="mt-1 text-xs text-foreground">{item.task}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
