"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUp01Icon,
  Attachment01Icon,
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

export function ChatArea() {
  const { activeThreadId, addThread } = useChatStore();
  const [input, setInput] = useState("");
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
    if (!input.trim() || !activeThreadId) return;
    sendMessage({ text: input });
    setInput("");
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
                  <div
                    className={cn(
                      "rounded-2xl p-3 text-sm leading-relaxed whitespace-pre-wrap",
                      isUser
                        ? "bg-secondary text-secondary-foreground"
                        : "text-foreground",
                    )}
                  >
                    {text}
                  </div>
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
        <div className="relative rounded-2xl border border-border bg-card shadow-sm transition-all focus-within:border-ring">
          {/* Model badge */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-2">
            <Badge variant="outline" className="cursor-pointer gap-1.5">
              <span className="size-2 rounded-full bg-primary" />
              MediMitra AI
            </Badge>
          </div>

          {/* Input row */}
          <div className="flex items-end gap-3 p-3">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-muted-foreground"
            >
              <HugeiconsIcon icon={Attachment01Icon} />
            </Button>
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
            <Button
              size="icon-sm"
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className={cn(
                "shrink-0 transition-all",
                !input.trim() && "opacity-50",
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
