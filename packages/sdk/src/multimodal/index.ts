import type { MimoHttpClient } from '../core/client.js';
import type { ChatRequest, ChatResponse, ContentBlock } from '../core/types.js';

export interface VisionInput {
  /** Plain prompt text. */
  text: string;
  /** One or more images: data URL, http(s) URL, or base64 PNG/JPG. */
  images: Array<string | { url: string; detail?: 'low' | 'high' | 'auto' }>;
  /** Optional system prompt. */
  system?: string;
  model?: string;
  max_tokens?: number;
}

export class MultimodalModule {
  constructor(private readonly http: MimoHttpClient) {}

  /**
   * One-shot vision-language call.
   *
   * Defaults to V2.5 base since multimodal lives there, not Pro. Override
   * with `model` if you've enabled multimodal on a different snapshot.
   */
  async describe(input: VisionInput): Promise<ChatResponse> {
    const blocks: ContentBlock[] = [{ type: 'text', text: input.text }];
    for (const img of input.images) {
      const ref = typeof img === 'string' ? { url: img } : img;
      blocks.push({ type: 'image_url', image_url: ref });
    }
    const body: ChatRequest = {
      model: input.model ?? this.http.models.base,
      messages: [
        ...(input.system
          ? [{ role: 'system' as const, content: input.system }]
          : []),
        { role: 'user' as const, content: blocks },
      ],
      max_tokens: input.max_tokens ?? 1024,
    };
    return this.http.post<ChatRequest, ChatResponse>('/chat/completions', body);
  }
}
