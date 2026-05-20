import { MimoError, type SDKConfig } from './types.js';

const DEFAULT_BASE = 'https://api.xiaomimimo.com/v1';

const DEFAULT_MODELS = {
  pro: 'mimo-v2.5-pro',
  base: 'mimo-v2.5',
  flash: 'mimo-v2-flash',
  tts: 'mimo-v2.5-tts',
  asr: 'mimo-v2.5-asr',
};

export class MimoHttpClient {
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly timeoutMs: number;
  readonly fetchImpl: typeof fetch;
  readonly models: typeof DEFAULT_MODELS;

  constructor(config: SDKConfig) {
    if (!config.apiKey) {
      throw new MimoError('apiKey is required');
    }
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE).replace(/\/$/, '');
    this.timeoutMs = config.timeoutMs ?? 60_000;
    this.fetchImpl = config.fetch ?? fetch;
    this.models = { ...DEFAULT_MODELS, ...(config.models ?? {}) };
  }

  async post<TBody, TResp>(path: string, body: TBody, init?: RequestInit): Promise<TResp> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await this.fetchImpl(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          ...(init?.headers ?? {}),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
        ...(init ?? {}),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new MimoError(
          `MiMo API error ${res.status}: ${text || res.statusText}`,
          res.status,
          res.headers.get('x-mimo-error-code') ?? undefined,
          res.headers.get('x-request-id') ?? undefined
        );
      }
      return (await res.json()) as TResp;
    } finally {
      clearTimeout(timer);
    }
  }

  async postStream(path: string, body: unknown): Promise<ReadableStream<Uint8Array>> {
    const url = `${this.baseUrl}${path}`;
    const res = await this.fetchImpl(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ ...(body as object), stream: true }),
    });
    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => '');
      throw new MimoError(
        `MiMo stream error ${res.status}: ${text || res.statusText}`,
        res.status
      );
    }
    return res.body;
  }
}
