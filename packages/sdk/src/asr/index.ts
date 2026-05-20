import { MimoError } from '../core/types.js';
import type { MimoHttpClient } from '../core/client.js';
import type { ASRRequest, ASRResponse } from '../core/types.js';

export interface TranscribeOptions {
  language?: string;
  timestamps?: boolean;
  model?: string;
}

export class ASRModule {
  constructor(private readonly http: MimoHttpClient) {}

  /**
   * Transcribe audio. Accepts either base64 string or Uint8Array bytes.
   *
   * For Bahasa-heavy use cases set `language: 'id'` to pin decoding.
   * Use `'auto'` (default) for code-switched speech (Bahasa + Java/Sunda).
   */
  async transcribe(
    audio: string | Uint8Array,
    format: 'wav' | 'mp3' | 'ogg' | 'webm' | 'm4a' = 'wav',
    opts: TranscribeOptions = {}
  ): Promise<ASRResponse> {
    if (!audio) throw new MimoError('audio is required');
    const b64 =
      typeof audio === 'string'
        ? audio
        : btoa(String.fromCharCode(...audio));
    const body: ASRRequest = {
      model: opts.model ?? this.http.models.asr,
      audio: b64,
      format,
      language: opts.language ?? 'auto',
      timestamps: opts.timestamps ?? false,
    };
    return this.http.post<ASRRequest, ASRResponse>('/audio/transcriptions', body);
  }
}
