"use client";

import { Sidebar } from "@/components/chat/sidebar";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { CalendarPanel } from "@/components/chat/calendar-panel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/lib/store";

export default function Home() {
  const { threads, activeThreadId } = useChatStore();
  const activeThread = threads.find((t) => t.id === activeThreadId);

  return (
    <div className="flex h-screen w-full pt-14 overflow-hidden bg-background font-sans text-foreground">
      {/* Left sidebar */}
      <Sidebar />

      {/* Main chat area */}
      <main className="relative flex flex-1 flex-col overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4 md:p-8">
          <div className="flex flex-col gap-2">
            {activeThread?.messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </div>
        </ScrollArea>

        {/* Input */}
        <ChatInput />
      </main>

      {/* Right calendar panel */}
      <CalendarPanel />
    </div>
  );
}
