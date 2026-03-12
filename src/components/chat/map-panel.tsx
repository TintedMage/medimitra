"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { MapPin, User, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const MOCK_DOCTORS = [
  { id: 1, name: "Dr. Sarah Smith", specialty: "Cardiologist", distance: "2.5 miles", rating: 4.8 },
  { id: 2, name: "Dr. John Doe", specialty: "Neurologist", distance: "3.1 miles", rating: 4.9 },
  { id: 3, name: "Dr. Emily Chen", specialty: "General Practice", distance: "4.0 miles", rating: 4.7 },
];

export function MapPanel() {
  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-border bg-sidebar animate-in slide-in-from-right-8 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-sidebar-foreground">
          <MapPin className="size-4 text-primary" />
          Nearby Specialists
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

      {/* Map Placeholder */}
      <div className="p-4">
        <div className="relative flex h-40 w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-accent/30 transition-colors hover:bg-accent/50">
          {/* Subtle grid pattern for "map" feel */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:12px_12px]" />
          <MapPin className="z-10 mb-2 size-8 animate-bounce text-primary drop-shadow-md" />
          <span className="z-10 text-xs font-medium text-muted-foreground">Map View Active</span>
        </div>
      </div>

      <Separator />

      {/* Doctors List */}
      <ScrollArea className="flex-1 p-4">
        <h3 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground">
          <User className="size-3" />
          Recommended For You
        </h3>
        <div className="h-full mb-10 flex flex-col gap-3">
          {MOCK_DOCTORS.map((doc) => (
            <div 
              key={doc.id} 
              className="flex flex-col gap-1 rounded-lg border border-border bg-card p-3 shadow-sm transition-colors hover:border-primary/50 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-foreground">{doc.name}</p>
                <div className="flex items-center gap-1 text-[10px] font-medium text-amber-500">
                  <Star className="size-3 fill-amber-500" />
                  {doc.rating}
                </div>
              </div>
              <p className="text-xs text-primary">{doc.specialty}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{doc.distance} away</p>
              <Button variant="secondary" size="sm" className="mt-3 h-7 text-[10px] w-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors">
                Book Consultation
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}