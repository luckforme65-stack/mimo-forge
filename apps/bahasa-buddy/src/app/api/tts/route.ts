import { NextRequest } from 'next/server';
import { getMimoClient } from '@/lib/mimo';
import { PERSONAS, type PersonaId } from '@/personas';

export const runtime = 'nodejs';

/**
 * POST /api/tts
 *
 * Body: { persona: PersonaId, text: string }
 * Returns: audio/mpeg bytes synthesised in the persona's voice.
 *
 * Note: Token Plan (tp-) keys do not currently expose /v1/audio/speech.
 * When TTS is unavailable, returns 503 with a friendly message instead
 * of crashing the UI. Switch to a Standard MiMo API key to enable.
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
  try {
    const audio = await mimo.tts.speak(text, { voice: p.voiceId, format: 'mp3' });
    return new Response(audio, {
      headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    const msg = (err as Error).message ?? '';
    // Token Plan endpoint returns 404 / 405 for /audio/speech
    if (msg.includes('404') || msg.includes('405') || msg.includes('not support')) {
      return Response.json(
        {
          error: 'tts_unavailable',
          message:
            'Voice synthesis butuh MiMo Standard API key. Token Plan key cuma support chat + multimodal.',
        },
        { status: 503 }
      );
    }
    return Response.json({ error: 'tts_failed', message: msg }, { status: 500 });
  }
}
