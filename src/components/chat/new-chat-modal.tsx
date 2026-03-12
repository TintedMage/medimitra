"use client";

import { useChatStore, FeatureMode } from "@/lib/store";
import { Stethoscope, FileText, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const features: {
  id: FeatureMode;
  title: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: "medication",
    title: "Medication & Schedule",
    description: "Get reminders and manage your daily health routines dynamically.",
    icon: Stethoscope,
  },
  {
    id: "report_summary",
    title: "Report Analysis",
    description: "Upload medical reports for an AI-powered summary and insights.",
    icon: FileText,
  },
  {
    id: "doctor_map",
    title: "Find a Doctor",
    description: "Upload your details to locate specialized doctors near your area.",
    icon: MapPin,
  },
];

export function NewChatModal() {
  const { isNewChatModalOpen, setNewChatModalOpen, addThread } = useChatStore();

  if (!isNewChatModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-card-foreground">Start a New Conversation</h2>
            <p className="text-sm text-muted-foreground mt-1">
              What kind of health assistance do you need today?
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={() => setNewChatModalOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => addThread(feature.id)}
              className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-background p-4 text-left transition-all hover:border-primary hover:bg-accent/30 hover:shadow-sm"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Background click handler */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={() => setNewChatModalOpen(false)}
      />
    </div>
  );
}