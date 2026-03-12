import { streamText, UIMessage, convertToModelMessages } from "ai";
import { ollama } from "ai-sdk-ollama";
import { db } from "@/lib/db";
import { messages as messagesTable, threads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const SYSTEM_PROMPT = `You are MediMitra, an expert AI healthcare assistant. Your role is to provide clear, accurate, and compassionate medical guidance to users based on their questions, uploaded images, and real-time health telemetry.

- Always prioritize user safety and evidence-based medical information.
- If a question is outside your scope or requires urgent care, advise the user to consult a licensed healthcare professional.
- When analyzing images, extract structured medical entities (e.g., medication names, dosages) using visual reasoning.
- Use any available telemetry (e.g., heart rate, SpO2) to personalize your advice, but never make a diagnosis.
- When appropriate, suggest actionable steps or routines.
- Respond in a calm, accessible, and supportive tone.
- Keep responses concise but thorough.`;

export async function POST(req: Request) {
  const {
    messages,
    threadId,
  }: { messages: UIMessage[]; threadId?: string } = await req.json();

  // Save user message to database
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  if (threadId && lastUserMessage) {
    const textPart = lastUserMessage.parts?.find((p) => p.type === "text");
    const content =
      textPart && "text" in textPart ? textPart.text : "";
    if (content) {
      await db.insert(messagesTable).values({
        id: lastUserMessage.id ?? `msg-${Date.now()}`,
        threadId,
        role: "user",
        content,
        createdAt: new Date(),
      });

      // Auto-title the thread from the first user message
      const existingMessages = await db
        .select()
        .from(messagesTable)
        .where(eq(messagesTable.threadId, threadId));
      const userMessages = existingMessages.filter((m) => m.role === "user");
      if (userMessages.length <= 1) {
        const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
        await db
          .update(threads)
          .set({ title })
          .where(eq(threads.id, threadId));
      }
    }
  }

  const result = streamText({
    model: ollama("gemma3:1b"),
    system: SYSTEM_PROMPT,
    temperature: 0.7,
    topK: 64,
    topP: 0.95,
    providerOptions: {
      ollama: {
        num_ctx: 32768,
        repeat_penalty: 1.1,
      },
    },
    messages: await convertToModelMessages(messages),
    async onFinish({ text }) {
      // Save assistant response to database
      if (threadId && text) {
        await db.insert(messagesTable).values({
          id: `msg-${Date.now()}-assistant`,
          threadId,
          role: "assistant",
          content: text,
          createdAt: new Date(),
        });
      }
    },
  });

  return result.toUIMessageStreamResponse();
}