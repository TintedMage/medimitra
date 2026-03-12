"use client";

import { useState, useRef, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Attachment01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useChatStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ChatInput() {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {  threads, activeThreadId, addMessage, setThreadUploaded } = useChatStore();
  const activeThread = threads.find((t) => t.id === activeThreadId);

  const handleSend = () => {
    if (!inputValue.trim() || !activeThreadId) return;

    addMessage(activeThreadId, {
      role: "user",
      content: inputValue.trim(),
    });
    setInputValue("");

    // Simulate assistant response
    setTimeout(() => {
      addMessage(activeThreadId, {
        role: "assistant",
        content:
          "Thank you for your question. I'm here to help with health-related information. Please note that I'm an AI assistant and my responses should not replace professional medical advice.",
      });
    }, 1000);
  };

  const handleUploadMockReport = () => {
    if (!activeThreadId) return;

    // 1. Mark as uploaded to trigger UI changes
    setThreadUploaded(activeThreadId, true);

    // 2. Add user message
    addMessage(activeThreadId, {
      role: "user",
      content: "I have uploaded my medical report (Mock).",
    });

    // 3. Add AI simulated response based on mode
    setTimeout(() => {
      let aiResponse = "I've received your report. How can I help you analyze it further?";
      
      if (activeThread?.mode === "doctor_map") {
        aiResponse = "I've analyzed your report. Based on the findings, I recommend consulting a specialist. I have located some highly-rated doctors near your area. You can view them on the map panel to your right.";
      } else if (activeThread?.mode === "report_summary") {
        aiResponse = "Report analyzed successfully. Your lipid profile shows slightly elevated levels. I've updated your daily routine in the calendar with recommended exercise and dietary adjustments.";
      }

      addMessage(activeThreadId, {
        role: "assistant",
        content: aiResponse,
      });
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
<div className="sticky bottom-0 flex flex-col w-full max-w-3xl mx-auto px-4 pb-4 md:px-8 md:pb-8 bg-background pt-0.5">
      <div className="relative rounded-2xl border border-border bg-card shadow-sm transition-all focus-within:border-ring">
        {/* Model selector & Context Actions */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <Badge variant="outline" className="cursor-pointer gap-1.5">
            <span className="size-2 rounded-full bg-primary" />
            MediMitra AI
          </Badge>

          {/* Conditional Mock Upload Button */}
          {activeThread && (activeThread.mode === "doctor_map" || activeThread.mode === "report_summary") && !activeThread.hasUploaded && (
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={handleUploadMockReport} 
              className="h-6 text-[10px] rounded-full px-3 animate-in fade-in zoom-in"
            >
              Upload Mock Report
            </Button>
          )}
        </div>

        {/* Input row */}
        <div className="flex items-end gap-3 p-3">
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-muted-foreground"
          >
            <HugeiconsIcon icon={Attachment01Icon} />
          </Button>
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your symptoms or ask a health question..."
            className="min-h-6 flex-1 resize-none border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-transparent"
            rows={1}
          />
          <Button
            size="icon-sm"
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={cn(
              "shrink-0 transition-all",
              !inputValue.trim() && "opacity-50",
            )}
          >
            <HugeiconsIcon icon={ArrowUp01Icon} />
          </Button>
        </div>
      </div>
      <p className="mt-3 text-center text-[10px] text-muted-foreground">
        AI responses are for informational purposes only. Always consult a
        healthcare professional.
      </p>
    </div>
  );
}
