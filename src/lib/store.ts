import { create } from "zustand";

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
};

type ChatState = {
  threads: ChatThread[];
  activeThreadId: string | null;
  sidebarOpen: boolean;
  calendarOpen: boolean;
  selectedDate: number;

  // Actions
  setActiveThread: (id: string) => void;
  addThread: () => void;
  deleteThread: (id: string) => void;
  addMessage: (threadId: string, message: Omit<Message, "id">) => void;
  toggleSidebar: () => void;
  toggleCalendar: () => void;
  setSelectedDate: (date: number) => void;
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
};

export const useChatStore = create<ChatState>((set) => ({
  threads: [defaultThread],
  activeThreadId: "thread-1",
  sidebarOpen: true,
  calendarOpen: true,
  selectedDate: 12,

  setActiveThread: (id) => set({ activeThreadId: id }),

  addThread: () => {
    const newThread: ChatThread = {
      id: `thread-${Date.now()}`,
      title: "New Chat",
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content:
            "Hello! How can I help you today?",
        },
      ],
      createdAt: new Date(),
    };
    set((state) => ({
      threads: [newThread, ...state.threads],
      activeThreadId: newThread.id,
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

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleCalendar: () =>
    set((state) => ({ calendarOpen: !state.calendarOpen })),
  setSelectedDate: (date) => set({ selectedDate: date }),
}));
