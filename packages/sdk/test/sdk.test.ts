import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MimoForge, MimoError } from '../dist/index.js';

test('MimoForge throws when apiKey missing', () => {
  assert.throws(() => new MimoForge({} as { apiKey: string }), MimoError);
});

test('MimoForge applies defaults', () => {
  const mimo = new MimoForge({ apiKey: 'mm-test' });
  assert.equal((mimo.chat as unknown as { http: { baseUrl: string } }).http.baseUrl, 'https://api.xiaomimimo.com/v1');
});

test('MimoForge respects model overrides', () => {
  const mimo = new MimoForge({
    apiKey: 'mm-test',
    models: { pro: 'mimo-custom-pro', tts: 'mimo-custom-tts' },
  });
  const http = (mimo.chat as unknown as { http: { models: Record<string, string> } }).http;
  assert.equal(http.models.pro, 'mimo-custom-pro');
  assert.equal(http.models.tts, 'mimo-custom-tts');
  // unspecified models keep defaults
  assert.equal(http.models.base, 'mimo-v2.5');
});

test('MimoForge sends Bearer auth header', async () => {
  let captured: Record<string, string> | undefined;
  const mockFetch: typeof fetch = async (_url, init) => {
    captured = (init?.headers as Record<string, string>) ?? {};
    return new Response(
      JSON.stringify({
        id: 'x',
        object: 'chat.completion',
        created: 0,
        model: 'mimo-v2.5-pro',
        choices: [
          { index: 0, message: { role: 'assistant', content: 'ok' }, finish_reason: 'stop' },
        ],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };
  const mimo = new MimoForge({ apiKey: 'mm-secret', fetch: mockFetch });
  await mimo.chat.complete([{ role: 'user', content: 'hi' }]);
  assert.equal(captured?.['Authorization'], 'Bearer mm-secret');
});
