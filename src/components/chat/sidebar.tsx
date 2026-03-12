"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Delete02Icon,
  Message01Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { useChatStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function SidebarItem({
  title,
  active,
  onClick,
}: {
  title: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center justify-between rounded-lg p-2 transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <HugeiconsIcon icon={Message01Icon} className="shrink-0" />
        <span className="truncate text-sm">{title}</span>
      </div>
      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="rounded p-1 hover:text-foreground">
          <HugeiconsIcon icon={MoreHorizontalIcon} />
        </span>
      </div>
    </button>
  );
}

export function Sidebar() {
  const { threads, activeThreadId, sidebarOpen, setActiveThread, addThread } =
    useChatStore();

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-64" : "w-0 overflow-hidden",
      )}
    >
      {/* Thread list */}
      <ScrollArea className="flex-1 p-3">
        <div className="flex justify-between pb-5">
          <p className="mb-2 mt-2 px-2 text-[10px] font-bold uppercase text-muted-foreground">
            Recent
          </p>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon-xs" onClick={addThread} />
              }
            >
              <HugeiconsIcon icon={Add01Icon} />
            </TooltipTrigger>
            <TooltipContent>New Chat</TooltipContent>
          </Tooltip>
        </div>
        <div className="flex flex-col gap-1">
          {threads.map((thread) => (
            <SidebarItem
              key={thread.id}
              title={thread.title}
              active={thread.id === activeThreadId}
              onClick={() => setActiveThread(thread.id)}
            />
          ))}
        </div>
      </ScrollArea>

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
