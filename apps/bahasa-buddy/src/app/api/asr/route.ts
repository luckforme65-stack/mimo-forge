import { NextRequest } from 'next/server';
import { getMimoClient } from '@/lib/mimo';

export const runtime = 'nodejs';

/**
 * POST /api/asr
 *
 * Body (multipart/form-data): file=audio blob, language=id|jv|su|auto
 * Returns: { text, language, duration_seconds }
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
  const out = await mimo.asr.transcribe(bytes, format, { language });
  return Response.json(out);
}
