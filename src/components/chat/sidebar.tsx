"use client";

import { useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Delete02Icon,
  Message01Icon,
} from "@hugeicons/core-free-icons";
import { useChatStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const {
    threads,
    activeThreadId,
    sidebarOpen,
    setThreads,
    setActiveThread,
    addThread,
    removeThread,
  } = useChatStore();

  // Fetch threads from DB on mount
  useEffect(() => {
    fetch("/api/threads")
      .then((r) => r.json())
      .then((data) => {
        setThreads(data);
        // Auto-select first thread if none active
        if (data.length > 0) setActiveThread(data[0].id);
      });
  }, [setThreads, setActiveThread]);

  const handleNewThread = async () => {
    const res = await fetch("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Chat" }),
    });
    const thread = await res.json();
    addThread(thread);
  };

  const handleDeleteThread = async (id: string) => {
    await fetch(`/api/threads?id=${id}`, { method: "DELETE" });
    removeThread(id);
  };

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-64" : "w-0 overflow-hidden",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <p className="text-[10px] font-bold uppercase text-muted-foreground">
          Recent
        </p>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleNewThread}
              />
            }
          >
            <HugeiconsIcon icon={Add01Icon} />
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      </div>

      {/* Thread list — native scroll */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="flex flex-col gap-1">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setActiveThread(thread.id)}
              className={cn(
                "group flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors",
                thread.id === activeThreadId
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <HugeiconsIcon icon={Message01Icon} className="shrink-0" />
                <span className="truncate text-sm">
                  {thread.title || "New Chat"}
                </span>
              </div>
              <span
                role="button"
                tabIndex={0}
                className="rounded p-1 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteThread(thread.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    handleDeleteThread(thread.id);
                  }
                }}
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} />
              </span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* User section */}
      <div className="p-3">
        <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent/50">
          <Avatar size="sm">
            <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
              G
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="truncate text-xs font-medium text-sidebar-foreground">
              Guest User
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
