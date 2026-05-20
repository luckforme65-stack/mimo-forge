import { NextRequest } from 'next/server';
import { getMimoClient } from '@/lib/mimo';

export const runtime = 'nodejs';

/**
 * POST /api/asr
 *
 * Body (multipart/form-data): file=audio blob, language=id|jv|su|auto
 * Returns: { text, language, duration_seconds }
 *
 * Note: Token Plan keys do not currently expose /v1/audio/transcriptions.
 * Returns 503 with a friendly hint when ASR is unavailable.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file');
  const language = (form.get('language') as string | null) ?? 'auto';

  if (!(file instanceof File)) {
    return Response.json({ error: 'file is required' }, { status: 400 });
  }

  const ext = (file.name.split('.').pop() ?? 'webm').toLowerCase();
  const formatMap: Record<string, 'wav' | 'mp3' | 'ogg' | 'webm' | 'm4a'> = {
    wav: 'wav',
    mp3: 'mp3',
    ogg: 'ogg',
    webm: 'webm',
    m4a: 'm4a',
  };
  const format = formatMap[ext] ?? 'webm';

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mimo = getMimoClient();
  try {
    const out = await mimo.asr.transcribe(bytes, format, { language });
    return Response.json(out);
  } catch (err) {
    const msg = (err as Error).message ?? '';
    if (msg.includes('404') || msg.includes('405') || msg.includes('not support')) {
      return Response.json(
        {
          error: 'asr_unavailable',
          message: 'Voice input butuh MiMo Standard API key. Saat ini Token Plan masih chat-only.',
        },
        { status: 503 }
      );
    }
    return Response.json({ error: 'asr_failed', message: msg }, { status: 500 });
  }
}
