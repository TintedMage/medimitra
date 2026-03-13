import { streamText, UIMessage, convertToModelMessages } from "ai";
import { ollama } from "ai-sdk-ollama";
import { db } from "@/lib/db";
import { messages as messagesTable, threads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const maxDuration = 30;
const SYSTEM_PROMPT = `You are MediMitra, an expert AI healthcare assistant. Your role is to provide clear, accurate, and compassionate medical guidance to users based on their questions, uploaded images, and real-time health telemetry.

- Always prioritize user safety and evidence-based medical information.
- If a question is outside your scope or requires urgent care, advise the user to consult a licensed healthcare professional.
- When analyzing images, extract structured medical entities (e.g., medication names, dosages) using visual reasoning.
- Use any available telemetry (e.g., heart rate, SpO2) to personalize your advice, but never make a diagnosis.
- When appropriate, suggest actionable steps or routines.
- Respond in a calm, accessible, and supportive tone.
- Keep responses concise but thorough.

Prescription JSON output rule:
- If the user asks to create, draft, structure, or update a prescription, you MUST include a machine-readable JSON object for database storage.
- The JSON must follow this exact shape:
{
  "title": "string",
  "doctorName": "string (optional)",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD (optional)",
  "notes": "string (optional)",
  "medications": [
    {
      "name": "string",
      "dosage": "string",
      "routine": [
        {
          "dayOfWeek": "number 0-6",
          "times": ["HH:mm"],
          "active": true
        }
      ],
      "notes": "string (optional)"
    }
  ]
}
- Output the JSON inside a fenced json block.
- Do not include trailing commas in JSON.
- After the JSON block, ask the user: "Do you want me to save this prescription?"`;

export async function POST(req: Request) {
  const {
    messages,
    threadId,
  }: { messages: UIMessage[]; threadId?: string } = await req.json();

  const modelId = 'gemma3:4b';

  // Save user message to database
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  if (threadId && lastUserMessage) {
    const textPart = lastUserMessage.parts?.find((p) => p.type === "text");
    const fileParts = lastUserMessage.parts?.filter((p) => p.type === "file") ?? [];
    const textContent = textPart && "text" in textPart ? textPart.text : "";
    const attachmentSummary = fileParts
      .map((part) => {
        if ("filename" in part && part.filename) {
          return `[Attachment: ${part.filename}]`;
        }
        return "[Attachment]";
      })
      .join(" ");
    const content = [textContent, attachmentSummary].filter(Boolean).join(" ");

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
    model: ollama(modelId),
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

  return result.toUIMessageStreamResponse({// This attaches the model name to the 'start' of the message
  messageMetadata: ({ part }) => {
    if (part.type === 'start') {
      return { model: modelId };
    }
  },});
}