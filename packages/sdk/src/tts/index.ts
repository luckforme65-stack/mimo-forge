import { MimoError } from '../core/types.js';
import type { MimoHttpClient } from '../core/client.js';
import type { TTSRequest } from '../core/types.js';

export interface SpeakOptions {
  voice?: string;
  format?: 'mp3' | 'wav' | 'ogg' | 'pcm';
  speed?: number;
  model?: string;
}

/** Built-in MiMo TTS voices. Use a cloned voice id for personalized output. */
export const BUILTIN_VOICES = {
  /** Calm female narrator, Bahasa Indonesia native. */
  ina: 'mimo:tts:id-female-calm',
  /** Warm male tutor voice. */
  budi: 'mimo:tts:id-male-warm',
  /** Energetic young female, suitable for kids content. */
  riri: 'mimo:tts:id-female-young',
  /** Older, grandfatherly Javanese-tinged voice. */
  pakdhe: 'mimo:tts:jv-male-elder',
} as const;

export class TTSModule {
  constructor(private readonly http: MimoHttpClient) {}

  /**
   * Synthesize speech and return raw audio bytes.
   *
   * Returns an `ArrayBuffer` you can pipe straight into Web Audio,
   * write to disk, or encode as a data URL.
   */
  async speak(text: string, opts: SpeakOptions = {}): Promise<ArrayBuffer> {
    if (!text || text.length === 0) throw new MimoError('text is required');
    const body: TTSRequest = {
      model: opts.model ?? this.http.models.tts,
      text,
      voice: opts.voice ?? BUILTIN_VOICES.ina,
      format: opts.format ?? 'mp3',
      speed: opts.speed ?? 1.0,
    };
    const url = `${this.http.baseUrl}/audio/speech`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.http.apiKey}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new MimoError(`TTS error ${res.status}: ${t || res.statusText}`, res.status);
    }
    return res.arrayBuffer();
  }

  /**
   * Stream TTS audio as it's synthesized for low-latency playback.
   * Yields chunks of `Uint8Array` that you can append to a MediaSource buffer.
   */
  async *stream(text: string, opts: SpeakOptions = {}): AsyncGenerator<Uint8Array> {
    const body: TTSRequest = {
      model: opts.model ?? this.http.models.tts,
      text,
      voice: opts.voice ?? BUILTIN_VOICES.ina,
      format: opts.format ?? 'mp3',
      speed: opts.speed ?? 1.0,
      stream: true,
    };
    const stream = await this.http.postStream('/audio/speech', body);
    const reader = stream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) yield value;
      }
    } finally {
      reader.releaseLock();
    }
  }
}
