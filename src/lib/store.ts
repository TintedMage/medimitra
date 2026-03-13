import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Thread = {
  id: string;
  title: string;
  createdAt: string | number | null;
};

export type MedicationRoutine = {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  times: string[]; // ["09:00", "18:00"]
  active: boolean;
};

export type PrescriptionMedication = {
  id: string;
  name: string;
  dosage: string;
  routine: MedicationRoutine[];
  notes?: string;
};

export type Prescription = {
  id: string;
  title: string;
  doctorName?: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
  medications: PrescriptionMedication[];
};

// Legacy medication type for backward compatibility
export type Medication = {
  id: string;
  name: string;
  dosage: string;
  startDate: Date;
  endDate?: Date;
  routine: MedicationRoutine[];
};

export type PrescriptionConfirmationState = "pending" | "dismissed" | "saved";

export type PrescriptionConfirmationEntry = {
  threadId: string;
  messageId: string;
  state: PrescriptionConfirmationState;
};

type ChatState = {
  // Thread management
  threads: Thread[];
  activeThreadId: string | null;
  sidebarOpen: boolean;
  setThreads: (threads: Thread[]) => void;
  addThread: (thread: Thread) => void;
  removeThread: (id: string) => void;
  setActiveThread: (id: string | null) => void;
  toggleSidebar: () => void;

  // Calendar & Prescription management
  calendarOpen: boolean;
  selectedDate: number; // 1-31
  prescriptions: Prescription[];
  setPrescriptions: (prescriptions: Prescription[]) => void;
  addPrescription: (prescription: Prescription) => void;
  removePrescription: (id: string) => void;
  updatePrescription: (id: string, prescription: Partial<Prescription>) => void;
  setSelectedDate: (date: number) => void;
  toggleCalendar: () => void;

  // Legacy medication support (for backward compatibility)
  medications: Medication[];
  setMedications: (medications: Medication[]) => void;
  addMedication: (medication: Medication) => void;
  removeMedication: (id: string) => void;
  updateMedication: (id: string, medication: Partial<Medication>) => void;

  // Prescription confirmation state (thread + message scoped)
  prescriptionConfirmations: Record<string, PrescriptionConfirmationEntry>;
  setPrescriptionConfirmationState: (
    threadId: string,
    messageId: string,
    state: PrescriptionConfirmationState,
  ) => void;
  togglePrescriptionConfirmationState: (
    threadId: string,
    messageId: string,
  ) => void;
  getPrescriptionConfirmationState: (
    threadId: string,
    messageId: string,
  ) => PrescriptionConfirmationState;
};

const getConfirmationKey = (threadId: string, messageId: string) =>
  `${threadId}:${messageId}`;

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
  // Thread management
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

  // Calendar & Prescription management
  calendarOpen: true,
  selectedDate: new Date().getDate(),
  prescriptions: [],
  setPrescriptions: (prescriptions) => set({ prescriptions }),
  addPrescription: (prescription) =>
    set((state) => ({
      prescriptions: [prescription, ...state.prescriptions],
    })),
  removePrescription: (id) =>
    set((state) => ({
      prescriptions: state.prescriptions.filter((p) => p.id !== id),
    })),
  updatePrescription: (id, prescription) =>
    set((state) => ({
      prescriptions: state.prescriptions.map((p) =>
        p.id === id ? { ...p, ...prescription } : p
      ),
    })),
  setSelectedDate: (date) => set({ selectedDate: date }),
  toggleCalendar: () => set((s) => ({ calendarOpen: !s.calendarOpen })),

  // Legacy medication support
  medications: [],
  setMedications: (medications) => set({ medications }),
  addMedication: (medication) =>
    set((state) => ({
      medications: [medication, ...state.medications],
    })),
  removeMedication: (id) =>
    set((state) => ({
      medications: state.medications.filter((m) => m.id !== id),
    })),
  updateMedication: (id, medication) =>
    set((state) => ({
      medications: state.medications.map((m) =>
        m.id === id ? { ...m, ...medication } : m
      ),
    })),

  // Prescription confirmation state
  prescriptionConfirmations: {},
  setPrescriptionConfirmationState: (threadId, messageId, confirmationState) =>
    set((state) => {
      const key = getConfirmationKey(threadId, messageId);
      return {
        prescriptionConfirmations: {
          ...state.prescriptionConfirmations,
          [key]: {
            threadId,
            messageId,
            state: confirmationState,
          },
        },
      };
    }),
  togglePrescriptionConfirmationState: (threadId, messageId) =>
    set((state) => {
      const key = getConfirmationKey(threadId, messageId);
      const current = state.prescriptionConfirmations[key]?.state ?? "pending";
      const nextState: PrescriptionConfirmationState =
        current === "dismissed" ? "pending" : "dismissed";

      return {
        prescriptionConfirmations: {
          ...state.prescriptionConfirmations,
          [key]: {
            threadId,
            messageId,
            state: nextState,
          },
        },
      };
    }),
  getPrescriptionConfirmationState: (threadId, messageId) => {
    const key = getConfirmationKey(threadId, messageId);
    return get().prescriptionConfirmations[key]?.state ?? "pending";
  },
}),
    {
      name: "medimitra-chat-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        prescriptionConfirmations: state.prescriptionConfirmations,
      }),
    },
  ),
);

