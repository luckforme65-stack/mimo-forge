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
  // Only forward env-var overrides if they're actually set — undefined values
  // would otherwise wipe the SDK defaults via spread.
  const models: Record<string, string> = {};
  if (process.env.MIMO_PRO_MODEL) models.pro = process.env.MIMO_PRO_MODEL;
  if (process.env.MIMO_BASE_MODEL) models.base = process.env.MIMO_BASE_MODEL;
  if (process.env.MIMO_TTS_MODEL) models.tts = process.env.MIMO_TTS_MODEL;
  if (process.env.MIMO_ASR_MODEL) models.asr = process.env.MIMO_ASR_MODEL;

  _client = new MimoForge({
    apiKey,
    baseUrl: process.env.MIMO_BASE_URL,
    models,
  });
  return _client;
}
