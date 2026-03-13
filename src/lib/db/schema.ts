import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const threads = sqliteTable("threads", {
  id: text("id").primaryKey(),
  title: text("title").notNull().default("New Chat"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  threadId: text("thread_id")
    .notNull()
    .references(() => threads.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Prescription table - main container for medical prescriptions
export const prescriptions = sqliteTable("prescriptions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(), // e.g., "Cough Treatment", "Hypertension Management"
  doctorName: text("doctor_name"), // prescribing doctor
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  endDate: integer("end_date", { mode: "timestamp" }), // optional end date
  notes: text("notes"), // additional prescription notes
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Prescription medications - individual medications within a prescription
// Routine type: [{ dayOfWeek: 0-6, times: ["09:00", "18:00"], active: boolean }]
export const prescriptionMedications = sqliteTable("prescription_medications", {
  id: text("id").primaryKey(),
  prescriptionId: text("prescription_id")
    .notNull()
    .references(() => prescriptions.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // medication name
  dosage: text("dosage").notNull(), // e.g., "500mg", "2 tablets" 
  routine: text("routine", { mode: "json" }).notNull().default(JSON.stringify([])), // JSON array of daily routines
  notes: text("notes"), // medication-specific notes
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Legacy medications table - keeping for backward compatibility during migration
export const medications = sqliteTable("medications", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  endDate: integer("end_date", { mode: "timestamp" }),
  routine: text("routine", { mode: "json" }).notNull().default(JSON.stringify([])), // JSON array of daily routines
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
