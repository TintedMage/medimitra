import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";


// 1. Make the function async
export async function GET(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> } // 2. Type params as a Promise
) {
  // 3. Await the params before accessing threadId
  const { threadId } = await params;

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.threadId, threadId))
    .orderBy(messages.createdAt);

  return Response.json(msgs);
}