import { db } from "@/lib/db";
import { threads, messages } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

// GET /api/threads — list all threads
export async function GET() {
  const all = await db.select().from(threads).orderBy(desc(threads.createdAt));
  return Response.json(all);
}

// POST /api/threads — create a new thread
export async function POST(req: Request) {
  const { title } = await req.json();
  const thread = {
    id: nanoid(),
    title: title || "New Chat",
    createdAt: new Date(),
  };
  await db.insert(threads).values(thread);
  return Response.json(thread);
}

// DELETE /api/threads?id=xxx — delete a thread
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  await db.delete(messages).where(eq(messages.threadId, id));
  await db.delete(threads).where(eq(threads.id, id));
  return Response.json({ ok: true });
}