import type { MimoHttpClient } from '../core/client.js';
import { parseSSE } from '../core/sse.js';
import type { ChatMessage, ChatRequest, ChatResponse, StreamChunk } from '../core/types.js';

export interface ChatOptions {
  /** Override the model. Defaults to client.models.pro. */
  model?: string;
  /** Pin temperature. Defaults to 0.4 for reasoning-heavy use. */
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  /** Opt into the V2.5 base 1M context window. */
  enable_long_context?: boolean;
}

export class ChatModule {
  constructor(private readonly http: MimoHttpClient) {}

  async complete(messages: ChatMessage[], opts: ChatOptions = {}): Promise<ChatResponse> {
    const body: ChatRequest = {
      model: opts.model ?? this.http.models.pro,
      messages,
      temperature: opts.temperature ?? 0.4,
      top_p: opts.top_p,
      max_tokens: opts.max_tokens,
      enable_long_context: opts.enable_long_context,
    };
    return this.http.post<ChatRequest, ChatResponse>('/chat/completions', body);
  }

  /**
   * Stream tokens as they arrive. Resolves with the full text once finished.
   *
   * Usage:
   *   const stream = await mimo.chat.stream(msgs);
   *   for await (const delta of stream) process.stdout.write(delta);
   */
  async stream(
    messages: ChatMessage[],
    opts: ChatOptions = {}
  ): Promise<AsyncGenerator<string>> {
    const body: ChatRequest = {
      model: opts.model ?? this.http.models.pro,
      messages,
      temperature: opts.temperature ?? 0.4,
      top_p: opts.top_p,
      max_tokens: opts.max_tokens,
      enable_long_context: opts.enable_long_context,
      stream: true,
    };
    const raw = await this.http.postStream('/chat/completions', body);
    return this.iterStream(raw);
  }

  private async *iterStream(raw: ReadableStream<Uint8Array>): AsyncGenerator<string> {
    for await (const data of parseSSE(raw)) {
      try {
        const chunk = JSON.parse(data) as StreamChunk;
        const delta = chunk.choices[0]?.delta?.content;
        if (typeof delta === 'string' && delta.length > 0) yield delta;
      } catch {
        // ignore parse errors on heartbeat/empty frames
      }
    }
  }
}
