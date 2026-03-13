"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUp01Icon,
  Attachment01Icon,
  CancelCircleIcon,
  Copy01Icon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  Add01Icon,
} from "@hugeicons/core-free-icons";
import { useChatStore } from "@/lib/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type ParsedPrescription = {
  title: string;
  doctorName?: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  medications: Array<{
    name: string;
    dosage: string;
    routine: Array<{
      dayOfWeek: number;
      times: string[];
      active: boolean;
    }>;
    notes?: string;
  }>;
};

function extractPrescriptionJson(text: string): ParsedPrescription | null {
  const jsonBlocks = [...text.matchAll(/```json\s*([\s\S]*?)\s*```/gi)];

  for (let index = jsonBlocks.length - 1; index >= 0; index -= 1) {
    const candidate = jsonBlocks[index]?.[1];
    if (!candidate) continue;

    try {
      const parsed = JSON.parse(candidate);

      if (
        typeof parsed?.title !== "string" ||
        typeof parsed?.startDate !== "string" ||
        !Array.isArray(parsed?.medications)
      ) {
        continue;
      }

      const medications = parsed.medications
        .map((medication: any) => {
          if (
            typeof medication?.name !== "string" ||
            typeof medication?.dosage !== "string"
          ) {
            return null;
          }

          const routine = Array.isArray(medication?.routine)
            ? medication.routine
                .map((entry: any) => {
                  if (
                    typeof entry?.dayOfWeek !== "number" ||
                    !Array.isArray(entry?.times)
                  ) {
                    return null;
                  }

                  return {
                    dayOfWeek: entry.dayOfWeek,
                    times: entry.times.filter(
                      (time: unknown) => typeof time === "string",
                    ),
                    active:
                      typeof entry.active === "boolean" ? entry.active : true,
                  };
                })
                .filter(Boolean)
            : [];

          return {
            name: medication.name,
            dosage: medication.dosage,
            routine,
            notes:
              typeof medication.notes === "string"
                ? medication.notes
                : undefined,
          };
        })
        .filter(Boolean) as ParsedPrescription["medications"];

      if (medications.length === 0) continue;

      return {
        title: parsed.title,
        doctorName:
          typeof parsed.doctorName === "string" ? parsed.doctorName : undefined,
        startDate: parsed.startDate,
        endDate:
          typeof parsed.endDate === "string" ? parsed.endDate : undefined,
        notes: typeof parsed.notes === "string" ? parsed.notes : undefined,
        medications,
      };
    } catch {
      continue;
    }
  }

  return null;
}

function stripPrescriptionJsonForDisplay(text: string): string {
  return text
    .replace(/```json\s*[\s\S]*?\s*```/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function ChatArea() {
  const {
    activeThreadId,
    addThread,
    addPrescription,
    getPrescriptionConfirmationState,
    setPrescriptionConfirmationState,
    togglePrescriptionConfirmationState,
  } = useChatStore();
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const [savingPrescriptionForMessageId, setSavingPrescriptionForMessageId] =
    useState<string | null>(null);
  const [isSyncingGoogleFit, setIsSyncingGoogleFit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // useChat — handles messages, streaming, sending
  const { messages, sendMessage, setMessages, status } = useChat({
    id: activeThreadId ?? undefined,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { threadId: activeThreadId },
    }),
  });

  const isStreaming = status === "streaming";
  const modelName = [...messages]
    .reverse()
    .find(
      (message) =>
        message.role === "assistant" &&
        message.metadata &&
        typeof message.metadata === "object" &&
        "model" in message.metadata,
    )?.metadata as { model?: string } | undefined;

  // Load saved messages from DB when thread changes
  useEffect(() => {
    if (!activeThreadId) {
      setMessages([]);
      return;
    }
    fetch(`/api/threads/${activeThreadId}/messages`)
      .then((r) => r.json())
      .then((rows: { id: string; role: string; content: string }[]) =>
        setMessages(
          rows.map((r) => ({
            id: r.id,
            role: r.role as "user" | "assistant",
            parts: [{ type: "text" as const, text: r.content }],
          })),
        ),
      )
      .catch(() => setMessages([]));
  }, [activeThreadId, setMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    if ((!input.trim() && !files) || !activeThreadId) return;

    if (input.trim()) {
      sendMessage({ text: input.trim(), files });
    } else if (files) {
      sendMessage({ files });
    }

    setInput("");
    setFiles(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSyncGoogleFitData = async () => {
    if (!activeThreadId || isStreaming || isSyncingGoogleFit) return;

    try {
      setIsSyncingGoogleFit(true);
      await sendMessage(
        {
          text: "Sync Google Fit telemetry now and provide a latest vitals summary with medication-relevant recommendations.",
        },
        {
          body: {
            threadId: activeThreadId,
            action: "FETCH_GOOGLE_FIT_DATA",
          },
        },
      );
    } catch {
      alert("Could not sync Google Fit data right now. Please try again.");
    } finally {
      setIsSyncingGoogleFit(false);
    }
  };

  const handleNewThread = async () => {
    const res = await fetch("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Chat" }),
    });
    const thread = await res.json();
    addThread(thread);
  };

  const handleDismissSavePrompt = (messageId: string) => {
    if (!activeThreadId) return;
    togglePrescriptionConfirmationState(activeThreadId, messageId);
  };

  const handleSavePrescription = async (
    messageId: string,
    prescription: ParsedPrescription,
  ) => {
    try {
      setSavingPrescriptionForMessageId(messageId);
      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(prescription),
      });

      if (!response.ok) {
        throw new Error("Failed to save prescription");
      }

      const saved = await response.json();
      addPrescription({
        ...saved,
        startDate: new Date(saved.startDate),
        endDate: saved.endDate ? new Date(saved.endDate) : undefined,
      });
      if (activeThreadId) {
        setPrescriptionConfirmationState(activeThreadId, messageId, "saved");
      }
      setMessages((current) => [
        ...current,
        {
          id: `msg-${crypto.randomUUID()}`,
          role: "assistant",
          parts: [
            {
              type: "text",
              text: "Prescription has been saved successfully.",
            },
          ],
        },
      ]);
    } catch {
      alert("Could not save prescription. Please try again.");
    } finally {
      setSavingPrescriptionForMessageId(null);
    }
  };

  // Empty state — no thread selected
  if (!activeThreadId) {
    return (
      <main className="flex flex-1 items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">Welcome to MediMitra</p>
          <p className="mt-1 text-sm">Create a new thread to start chatting</p>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-lg"
                  onClick={handleNewThread}
                  className={"mt-4"}
                />
              }
            >
              <HugeiconsIcon icon={Add01Icon} />
            </TooltipTrigger>
            <TooltipContent>New Chat</TooltipContent>
          </Tooltip>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      {/* Messages — native scroll */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-32">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            const text = msg.parts
              ?.filter((p) => p.type === "text")
              .map((p) => ("text" in p ? p.text : ""))
              .join("");
            if (!text) return null;
            const displayText = !isUser
              ? stripPrescriptionJsonForDisplay(text)
              : text;
            const parsedPrescription =
              !isUser && !isStreaming ? extractPrescriptionJson(text) : null;
            const confirmationState =
              activeThreadId && !isUser
                ? getPrescriptionConfirmationState(activeThreadId, msg.id)
                : "pending";
            const showSavePrompt =
              !isUser &&
              parsedPrescription &&
              confirmationState !== "saved" &&
              confirmationState !== "dismissed";

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex w-full gap-4",
                  isUser ? "justify-end" : "justify-start",
                )}
              >
                {!isUser && (
                  <Avatar size="sm">
                    <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                      M
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "flex flex-col gap-2",
                    isUser ? "items-end" : "items-start",
                  )}
                >
                  {displayText && (
                    <div
                      className={cn(
                        "rounded-2xl p-3 text-sm leading-relaxed whitespace-pre-wrap",
                        isUser
                          ? "bg-secondary text-secondary-foreground"
                          : "text-foreground",
                      )}
                    >
                      {displayText}
                    </div>
                  )}
                  {!isUser && (
                    <div className="flex gap-3 mt-1">
                      <button className="text-muted-foreground transition-colors hover:text-foreground">
                        <HugeiconsIcon icon={Copy01Icon} />
                      </button>
                      <button className="text-muted-foreground transition-colors hover:text-foreground">
                        <HugeiconsIcon icon={ThumbsUpIcon} />
                      </button>
                      <button className="text-muted-foreground transition-colors hover:text-foreground">
                        <HugeiconsIcon icon={ThumbsDownIcon} />
                      </button>
                    </div>
                  )}
                  {showSavePrompt && parsedPrescription && (
                    <div className="mt-3 rounded-lg border border-border bg-card p-3 text-sm">
                      <p className="text-foreground">
                        Do you want to save this prescription?
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleSavePrescription(msg.id, parsedPrescription)
                          }
                          disabled={
                            savingPrescriptionForMessageId === msg.id ||
                            isStreaming
                          }
                        >
                          {savingPrescriptionForMessageId === msg.id
                            ? "Saving..."
                            : "Save Prescription"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDismissSavePrompt(msg.id)}
                          disabled={savingPrescriptionForMessageId === msg.id}
                        >
                          Not now
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                {isUser && (
                  <Avatar size="sm">
                    <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                      G
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}

          {/* Streaming indicator */}
          {isStreaming && (
            <div className="flex gap-4">
              <Avatar size="sm">
                <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                  M
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-1.5 animate-pulse rounded-full bg-current" />
                <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:150ms]" />
                <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="sticky bottom-0 mx-auto flex w-full max-w-3xl flex-col px-4 pb-4 pt-0.5 md:px-8 md:pb-8">
        <div className="mb-2 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSyncGoogleFitData}
            disabled={isStreaming || isSyncingGoogleFit}
          >
            <HugeiconsIcon icon={Add01Icon} />
            {isSyncingGoogleFit ? "Syncing..." : "Sync Google Fit Data"}
          </Button>
        </div>
        <div className="relative rounded-2xl border border-border bg-card shadow-sm transition-all focus-within:border-ring">
          {/* Model badge */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-2">
            <Badge variant="outline" className="cursor-pointer gap-1.5">
              <span className="size-2 rounded-full bg-primary" />
              {modelName?.model || "MediMitra AI"}
            </Badge>
          </div>

          {/* Input row */}
          <div className="flex items-end gap-3 p-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(event) => {
                if (event.target.files && event.target.files.length > 0) {
                  setFiles(event.target.files);
                }
              }}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-muted-foreground"
              onClick={() => fileInputRef.current?.click()}
            >
              <HugeiconsIcon icon={Attachment01Icon} />
            </Button>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              {files && files.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{files[0]?.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      setFiles(undefined);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    <HugeiconsIcon icon={CancelCircleIcon} />
                  </Button>
                </div>
              )}
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Describe your symptoms or ask a health question..."
                className="min-h-6 flex-1 resize-none border-none bg-transparent shadow-none focus-visible:ring-0"
                rows={1}
              />
            </div>
            <Button
              size="icon-sm"
              onClick={handleSend}
              disabled={(!input.trim() && !files) || isStreaming}
              className={cn(
                "shrink-0 transition-all",
                !input.trim() && !files && "opacity-50",
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
    </main>
  );
}
