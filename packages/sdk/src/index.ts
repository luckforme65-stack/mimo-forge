/**
 * @mimoforge/sdk — unified TypeScript SDK for the Xiaomi MiMo platform.
 *
 *   import { MimoForge } from '@mimoforge/sdk';
 *
 *   const mimo = new MimoForge({ apiKey: process.env.MIMO_API_KEY! });
 *
 *   // Reasoning
 *   const reply = await mimo.chat.complete([
 *     { role: 'user', content: 'Bagaimana cara hindari investasi bodong?' },
 *   ]);
 *
 *   // Vision
 *   const desc = await mimo.multimodal.describe({
 *     text: 'Apakah pesan WhatsApp ini scam?',
 *     images: ['data:image/png;base64,...'],
 *   });
 *
 *   // Voice in
 *   const text = await mimo.asr.transcribe(audioBytes, 'wav', { language: 'id' });
 *
 *   // Voice out
 *   const audio = await mimo.tts.speak('Halo, Reyn!', { voice: 'mimo:tts:id-female-calm' });
 */

import { MimoHttpClient } from './core/client.js';
import { ChatModule } from './chat/index.js';
import { MultimodalModule } from './multimodal/index.js';
import { TTSModule } from './tts/index.js';
import { ASRModule } from './asr/index.js';
import type { SDKConfig } from './core/types.js';

export class MimoForge {
  readonly chat: ChatModule;
  readonly multimodal: MultimodalModule;
  readonly tts: TTSModule;
  readonly asr: ASRModule;

  constructor(config: SDKConfig) {
    const http = new MimoHttpClient(config);
    this.chat = new ChatModule(http);
    this.multimodal = new MultimodalModule(http);
    this.tts = new TTSModule(http);
    this.asr = new ASRModule(http);
  }
}

export * from './core/types.js';
export { BUILTIN_VOICES } from './tts/index.js';
