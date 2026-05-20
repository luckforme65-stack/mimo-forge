import { NextRequest } from 'next/server';
import { getMimoClient } from '@/lib/mimo';
import { PERSONAS, type PersonaId } from '@/personas';

export const runtime = 'nodejs';

/**
 * POST /api/tts
 *
 * Body: { persona: PersonaId, text: string }
 * Returns: audio/mpeg bytes synthesised in the persona's voice.
 */
export async function POST(req: NextRequest) {
  const { persona, text } = (await req.json()) as {
    persona: PersonaId;
    text: string;
  };
  const p = PERSONAS[persona];
  if (!p) return new Response('unknown persona', { status: 400 });
  if (!text || text.trim().length === 0) {
    return new Response('text is required', { status: 400 });
  }

  const mimo = getMimoClient();
  const audio = await mimo.tts.speak(text, { voice: p.voiceId, format: 'mp3' });

  return new Response(audio, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
    },
  });
}
