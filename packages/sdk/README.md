# @mimoforge/sdk

> Unified TypeScript SDK for the **Xiaomi MiMo** platform — chat, multimodal vision, voice synthesis, and speech recognition through one cohesive API.

```bash
npm install @mimoforge/sdk
```

## Quick start

```ts
import { MimoForge } from '@mimoforge/sdk';

const mimo = new MimoForge({ apiKey: process.env.MIMO_API_KEY! });

// Reasoning (Pro)
const reply = await mimo.chat.complete([
  { role: 'system', content: 'Kamu asisten Bahasa Indonesia yang ramah.' },
  { role: 'user', content: 'Jelaskan investasi bodong dengan analogi.' },
]);
console.log(reply.choices[0].message.content);
```

## Modules

| Module | Default model | What it does |
|--------|--------------|--------------|
| `mimo.chat` | `mimo-v2.5-pro` | Chat completions, streaming, long-horizon reasoning |
| `mimo.multimodal` | `mimo-v2.5` | Vision-language understanding (images + text, 1M context) |
| `mimo.tts` | `mimo-v2.5-tts` | Text-to-speech with 4 built-in voices and voice cloning |
| `mimo.asr` | `mimo-v2.5-asr` | Speech-to-text with Bahasa + Java/Sunda code-switch support |

## Streaming chat

```ts
const stream = await mimo.chat.stream([
  { role: 'user', content: 'Tulis pantun tentang Yogyakarta.' },
]);
for await (const delta of stream) process.stdout.write(delta);
```

## Vision

```ts
const out = await mimo.multimodal.describe({
  text: 'Apakah pesan WhatsApp ini scam? Beri alasan singkat.',
  images: ['data:image/png;base64,...'],
  system: 'Kamu detektif scam Bahasa.',
});
```

## Voice in / voice out

```ts
// ASR — code-switched Bahasa + Jawa works out of the box
const t = await mimo.asr.transcribe(wavBytes, 'wav', { language: 'auto' });
console.log(t.text);

// TTS — built-in voice
import { BUILTIN_VOICES } from '@mimoforge/sdk';
const audio = await mimo.tts.speak('Halo, Pak Budi!', {
  voice: BUILTIN_VOICES.budi,
  format: 'mp3',
});
// Save to disk
import { writeFileSync } from 'node:fs';
writeFileSync('hello.mp3', Buffer.from(audio));
```

## Streaming TTS for low-latency playback

```ts
const chunks: Uint8Array[] = [];
for await (const chunk of mimo.tts.stream('Selamat pagi, semoga harinya menyenangkan!')) {
  chunks.push(chunk);
}
```

## Error handling

```ts
import { MimoError } from '@mimoforge/sdk';

try {
  await mimo.chat.complete([{ role: 'user', content: 'hi' }]);
} catch (e) {
  if (e instanceof MimoError) {
    console.error('MiMo failed:', e.status, e.code, e.requestId);
  }
}
```

## Configuration

```ts
new MimoForge({
  apiKey: process.env.MIMO_API_KEY!,
  baseUrl: 'https://api.xiaomimimo.com/v1', // override for self-hosted gateway
  timeoutMs: 60_000,
  models: {
    pro: 'mimo-v2.5-pro',
    base: 'mimo-v2.5',
    tts: 'mimo-v2.5-tts',
    asr: 'mimo-v2.5-asr',
  },
});
```

## Why an SDK at all?

The MiMo platform exposes an OpenAI-compatible `/v1/chat/completions` plus dedicated endpoints for `/audio/speech` (TTS) and `/audio/transcriptions` (ASR). You *can* call them directly with `fetch`. This SDK exists because:

1. **Multimodal block ordering is fiddly** — the MiMo platform expects `image_url`, `input_audio`, and `text` blocks in a specific shape, easy to get wrong.
2. **TTS voice ids** are non-obvious. We curate a `BUILTIN_VOICES` catalog so dev autocomplete shows real values.
3. **Streaming SSE** is the same shape as OpenAI but heartbeat handling differs subtly. We've absorbed the pitfalls.
4. **Bahasa code-switch ASR** needs `language: 'auto'` (not `'id'`) to handle Jawa/Sunda mixing — non-obvious from docs.
5. **Edge runtime safety** — zero non-runtime deps, so this works in Vercel Edge, Cloudflare Workers, Bun, Deno.

## License

MIT — fork it, ship it, build the MiMo ecosystem.
