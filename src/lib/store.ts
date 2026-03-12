import { create } from "zustand";

export type FeatureMode = "general" | "medication" | "report_summary" | "doctor_map";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type ChatThread = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  mode: FeatureMode;
  hasUploaded?: boolean;
};

type ChatState = {
  threads: ChatThread[];
  activeThreadId: string | null;
  sidebarOpen: boolean;
  calendarOpen: boolean;
  selectedDate: number;
  isNewChatModalOpen: boolean;

  // Actions
  setActiveThread: (id: string) => void;
  addThread: (mode: FeatureMode) => void;
  deleteThread: (id: string) => void;
  addMessage: (threadId: string, message: Omit<Message, "id">) => void;
  toggleSidebar: () => void;
  toggleCalendar: () => void;
  setSelectedDate: (date: number) => void;
  setNewChatModalOpen: (isOpen: boolean) => void;
  setThreadUploaded: (threadId: string, uploaded: boolean) => void;
};

const defaultMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hello! I'm MediMitra, your AI health assistant. I can help you with medical information, symptom analysis, and health-related questions. How can I assist you today?",
  },
];

const defaultThread: ChatThread = {
  id: "thread-1",
  title: "Health Assistant Chat",
  messages: defaultMessages,
  createdAt: new Date(),
  mode: "general",
  hasUploaded: false,
};

export const useChatStore = create<ChatState>((set) => ({
  threads: [defaultThread],
  activeThreadId: "thread-1",
  sidebarOpen: true,
  calendarOpen: false,
  selectedDate: 12,
  isNewChatModalOpen: false,

  setActiveThread: (id) => set((state) => {
    const thread = state.threads.find((t) => t.id === id);
    return { 
      activeThreadId: id,
      // Automatically manage calendar visibility based on mode
      calendarOpen: thread?.mode === "medication" || thread?.mode === "general"
    };
  }),

  setNewChatModalOpen: (isOpen) => set({ isNewChatModalOpen: isOpen }),

  addThread: (mode) => {
    const titles: Record<FeatureMode, string> = {
      general: "New Chat",
      medication: "Medication Routine",
      report_summary: "Report Analysis",
      doctor_map: "Find a Doctor",
    };

    const newThread: ChatThread = {
      id: `thread-${Date.now()}`,
      title: titles[mode],
      mode,
      hasUploaded: false,
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: `Hello! You've selected the **${titles[mode]}** feature. How can I help you get started?`,
        },
      ],
      createdAt: new Date(),
    };
    
    set((state) => ({
      threads: [newThread, ...state.threads],
      activeThreadId: newThread.id,
      isNewChatModalOpen: false, // Close modal on creation
      // Set the calendar visibility based on the newly selected mode
      calendarOpen: mode === "medication" || mode === "general"
    }));
  },

  deleteThread: (id) =>
    set((state) => {
      const filtered = state.threads.filter((t) => t.id !== id);
      return {
        threads: filtered,
        activeThreadId:
          state.activeThreadId === id
            ? filtered[0]?.id ?? null
            : state.activeThreadId,
      };
    }),

  addMessage: (threadId, message) =>
    set((state) => ({
      threads: state.threads.map((t) =>
        t.id === threadId
          ? {
              ...t,
              messages: [
                ...t.messages,
                { ...message, id: `msg-${Date.now()}` },
              ],
            }
          : t
      ),
    })),

  setThreadUploaded: (threadId, uploaded) =>
    set((state) => ({
      threads: state.threads.map((t) =>
        t.id === threadId ? { ...t, hasUploaded: uploaded } : t
      ),
    })),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleCalendar: () => set((state) => ({ calendarOpen: !state.calendarOpen })),
  setSelectedDate: (date) => set({ selectedDate: date }),
}));