import { NextRequest } from 'next/server';
import { getMimoClient } from '@/lib/mimo';
import { PERSONAS, type PersonaId } from '@/personas';
import type { ChatMessage, ContentBlock } from '@mimoforge/sdk';

export const runtime = 'nodejs';

interface ChatBody {
  persona: PersonaId;
  messages: Array<{
    role: 'user' | 'assistant';
    text: string;
    images?: string[];
  }>;
}

/**
 * POST /api/chat
 *
 * Streams a persona-tuned MiMo response token-by-token via SSE.
 *
 * Server picks the persona's system prompt, voice, and reasoning depth.
 * Client only sends user-visible messages, so prompt-injection attempts
 * stay scoped to the persona's guardrails.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as ChatBody;
  const persona = PERSONAS[body.persona];
  if (!persona) return new Response('unknown persona', { status: 400 });

  const mimo = getMimoClient();

  const messages: ChatMessage[] = [
    { role: 'system', content: persona.systemPrompt },
    ...body.messages.map((m): ChatMessage => {
      if (m.images && m.images.length > 0) {
        const blocks: ContentBlock[] = [{ type: 'text', text: m.text }];
        for (const img of m.images) {
          blocks.push({ type: 'image_url', image_url: { url: img } });
        }
        return { role: m.role, content: blocks };
      }
      return { role: m.role, content: m.text };
    }),
  ];

  const useMultimodal = body.messages.some((m) => m.images && m.images.length > 0);
  // Token Plan supports both pro (text) and v2.5 (vision) via /v1/chat/completions.
  // For image inputs we must use mimo-v2.5 (multimodal); for text-only stick with persona's
  // configured reasoning depth (pro by default).
  const stream = await mimo.chat.stream(messages, {
    temperature: persona.temperature,
    enable_long_context: persona.enableLongContext,
    ...(useMultimodal ? { model: 'mimo-v2.5' } : {}),
  });

  const encoder = new TextEncoder();
  const sse = new ReadableStream({
    async start(controller) {
      try {
        for await (const delta of stream) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: String((err as Error).message ?? err) })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(sse, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
