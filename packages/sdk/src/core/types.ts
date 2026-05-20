/**
 * Shared types for the MiMo Forge SDK.
 *
 * These mirror the OpenAI-compatible contract that the MiMo platform exposes,
 * with extensions for MiMo-specific features (long context window, voice cloning,
 * multimodal block ordering).
 */

export type Role = 'system' | 'user' | 'assistant' | 'tool';

export interface TextBlock {
  type: 'text';
  text: string;
}

export interface ImageBlock {
  type: 'image_url';
  image_url: { url: string; detail?: 'low' | 'high' | 'auto' };
}

export interface AudioBlock {
  type: 'input_audio';
  input_audio: { data: string; format: 'wav' | 'mp3' | 'ogg' };
}

export type ContentBlock = TextBlock | ImageBlock | AudioBlock;

export interface ChatMessage {
  role: Role;
  content: string | ContentBlock[];
  name?: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  /**
   * MiMo extension. Pass `enable_long_context: true` to opt-in to the
   * 1M-token window on V2.5 base. Ignored by Pro (always on) and Flash.
   */
  enable_long_context?: boolean;
}

export interface ChatResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter';
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export interface StreamChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: Partial<ChatMessage>;
    finish_reason: string | null;
  }>;
}

export interface TTSRequest {
  model: string;
  text: string;
  /** A built-in voice id, or a cloned voice handle. */
  voice: string;
  /** Output format for the audio. mp3 default. */
  format?: 'mp3' | 'wav' | 'ogg' | 'pcm';
  /** Speech rate. 1.0 = natural. */
  speed?: number;
  /** Stream byte-by-byte for low-latency playback. */
  stream?: boolean;
}

export interface ASRRequest {
  model: string;
  /** Base64-encoded audio bytes. */
  audio: string;
  format: 'wav' | 'mp3' | 'ogg' | 'webm' | 'm4a';
  /** Hint language to bias decoding. e.g. 'id', 'jv', 'su', 'auto'. */
  language?: string;
  /** Return word-level timestamps. */
  timestamps?: boolean;
}

export interface ASRResponse {
  text: string;
  language: string;
  duration_seconds: number;
  segments?: Array<{ start: number; end: number; text: string }>;
}

export interface SDKConfig {
  apiKey: string;
  baseUrl?: string;
  timeoutMs?: number;
  /** Optional fetch override. Useful in edge runtimes. */
  fetch?: typeof fetch;
  /** Default model overrides. */
  models?: Partial<{
    pro: string;
    base: string;
    flash: string;
    tts: string;
    asr: string;
  }>;
}

export class MimoError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public requestId?: string
  ) {
    super(message);
    this.name = 'MimoError';
  }
}
