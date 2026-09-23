import { createGoogle } from '@ai-sdk/google';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai';
import { buildInstructions } from '@/lib/prompt';
import { tools } from '@/lib/tools';

export const maxDuration = 30;

// The key is read here, on the server only; it never reaches the browser.
const google = createGoogle({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

const MAX_FACTS = 30;
const MAX_FACT_LENGTH = 200;

function sanitizeMemory(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((f): f is string => typeof f === 'string')
    .map((f) => f.replace(/\s+/g, ' ').trim().slice(0, MAX_FACT_LENGTH))
    .filter(Boolean)
    .slice(-MAX_FACTS);
}

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      { error: 'GOOGLE_GENERATIVE_AI_API_KEY is not set on the server.' },
      { status: 500 },
    );
  }

  const { messages, memory }: { messages: UIMessage[]; memory?: unknown } = await req.json();

  const result = streamText({
    model: google('gemini-3.5-flash'),
    instructions: buildInstructions(sanitizeMemory(memory)),
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: isStepCount(5),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError: (error) => {
        console.error('[chat] stream error:', error);
        return 'Ridge ran into a problem answering that. Please try again.';
      },
    }),
  });
}
