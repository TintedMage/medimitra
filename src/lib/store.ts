import { create } from "zustand";

type Thread = {
  id: string;
  title: string;
  createdAt: string | number | null;
};

type ChatState = {
  threads: Thread[];
  activeThreadId: string | null;
  sidebarOpen: boolean;
  setThreads: (threads: Thread[]) => void;
  addThread: (thread: Thread) => void;
  removeThread: (id: string) => void;
  setActiveThread: (id: string | null) => void;
  toggleSidebar: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  threads: [],
  activeThreadId: null,
  sidebarOpen: true,
  setThreads: (threads) => set({ threads }),
  addThread: (thread) =>
    set((state) => ({
      threads: [thread, ...state.threads],
      activeThreadId: thread.id,
    })),
  removeThread: (id) =>
    set((state) => {
      const filtered = state.threads.filter((t) => t.id !== id);
      return {
        threads: filtered,
        activeThreadId:
          state.activeThreadId === id
            ? (filtered[0]?.id ?? null)
            : state.activeThreadId,
      };
    }),
  setActiveThread: (id) => set({ activeThreadId: id }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));

