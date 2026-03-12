"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  ThumbsUpIcon,
  ThumbsDownIcon,
} from "@hugeicons/core-free-icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/store";

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <>
    <div
      className={cn(
        "flex w-full max-w-3xl mx-auto gap-4 mb-6",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {/* Assistant avatar */}
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
            "rounded-2xl p-3 text-sm leading-relaxed bg-card",
            isUser
              ? "bg-secondary text-secondary-foreground"
              : "text-foreground",
            )}
        >
          {message.content}
        </div>

        {/* Action buttons for assistant messages */}
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

      {/* User avatar */}
      {isUser && (
        <Avatar size="sm">
          <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
            G
          </AvatarFallback>
        </Avatar>
      )}
    </div>
            </>
  );
}
