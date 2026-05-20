import { MimoForge } from '@mimoforge/sdk';

let _client: MimoForge | null = null;

/**
 * Server-only MiMo client. Reads from process.env on first call.
 * Throws if MIMO_API_KEY is not set so misconfig is caught at request time
 * instead of producing 401s deep in user flows.
 */
export function getMimoClient(): MimoForge {
  if (_client) return _client;
  const apiKey = process.env.MIMO_API_KEY;
  if (!apiKey) {
    throw new Error(
      'MIMO_API_KEY is not set. Copy .env.example to .env.local and fill in your platform.xiaomimimo.com key.'
    );
  }
  _client = new MimoForge({
    apiKey,
    baseUrl: process.env.MIMO_BASE_URL,
    models: {
      pro: process.env.MIMO_PRO_MODEL,
      base: process.env.MIMO_BASE_MODEL,
      tts: process.env.MIMO_TTS_MODEL,
      asr: process.env.MIMO_ASR_MODEL,
    },
  });
  return _client;
}
