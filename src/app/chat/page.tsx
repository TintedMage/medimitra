"use client";

import { Sidebar } from "@/components/chat/sidebar";
import { ChatArea } from "@/components/chat/chat-area";
import { CalendarPanel } from "@/components/chat/calendar-panel";

export default function ChatPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background pt-14 font-sans text-foreground">
      <Sidebar />
      <ChatArea />
      <CalendarPanel />
    </div>
  );
}
