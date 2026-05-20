# Architecture

## Why a monorepo

The SDK and Bahasa Buddy live together because they evolve together. When MiMo ships a new model (e.g. `mimo-v3-flash`), the SDK adds the model id, the Buddy persona file picks it up via env var, and one PR captures the entire upgrade.

```
┌─────────────────────────────────────────────────────────────┐
│                   MiMo Forge Monorepo                       │
│                                                             │
│  ┌──────────────────┐         ┌────────────────────────┐    │
│  │  @mimoforge/sdk  │ ──used──│   apps/bahasa-buddy   │    │
│  │  (npm package)   │         │   (Next.js 16 app)    │    │
│  └────────┬─────────┘         └───────────┬────────────┘    │
│           │                                 │                │
│           └────────────┬────────────────────┘                │
│                        ▼                                     │
│              ┌──────────────────────┐                        │
│              │ Xiaomi MiMo Platform │                        │
│              │  (api.xiaomimimo.com)│                        │
│              └──────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## SDK design

### Module boundaries

```
src/
├── core/
│   ├── client.ts     ← single HTTP layer, owns auth + timeouts
│   ├── sse.ts        ← runtime-agnostic SSE parser (no eventsource lib)
│   └── types.ts      ← public type contract (frozen for v0.x)
├── chat/             ← /v1/chat/completions wrapper
├── multimodal/       ← block-builder helpers around chat
├── tts/              ← /v1/audio/speech wrapper
└── asr/              ← /v1/audio/transcriptions wrapper
```

Each module receives a `MimoHttpClient` instance via constructor injection — no globals, no top-level fetches, easy to mock in tests.

### Why no dependencies

The SDK targets four runtimes: **Node 18+, Bun, Deno, Edge** (Cloudflare Workers / Vercel Edge). Every dependency narrows that surface. We use:

- Native `fetch` — universal in modern runtimes
- Native `ReadableStream` — universal
- `TextDecoder` — universal
- `AbortController` — universal

The only build-time tool is `tsc`. No bundler, no plugin chain, no surprise transitive deps.

### SSE parsing pitfall

The MiMo platform uses standard SSE format (`data: ...\n\n`) but emits **two heartbeat shapes**:

1. Empty `data:` lines (just keepalive)
2. `data: {"choices":[{"delta":{}}]}` (delta with no content)

The parser in `core/sse.ts` ignores the first by checking line length, and the consumer in `chat/index.ts` ignores the second by checking `typeof delta === 'string'`. Both checks are required — drop either and you get `undefined` characters in your stream.

## Bahasa Buddy design

### Why three personas, not one

A single "do everything" assistant would have to compromise on tone. A scam-victim grandmother needs slow, empathic Pak Budi voice. A 4th-grader needs cheerful Bu Riri. A warung owner needs efficient Mbak Ina who quotes numbers. Persona-tuning lets each segment feel like the app was made for them.

### Server-only API key

`src/lib/mimo.ts` is server-only. The MiMo API key never reaches the browser. Routes:

- `POST /api/chat` — streams SSE back to client
- `POST /api/tts` — returns `audio/mpeg` bytes
- `POST /api/asr` — accepts multipart audio, returns JSON

The client only knows persona ids and chat content, not credentials.

### Voice round-trip latency budget

Target: **< 1.5s from user-stops-talking to first audio byte**.

```
ASR (record stop → text)     ~ 400-700ms
Reasoning streaming (TTFT)   ~ 300-500ms (Pro warm)
TTS streaming first chunk    ~ 200-400ms
                             ────────────
                             ~ 900-1600ms total
```

Pro's first-token is the bottleneck. We mitigate by sending TTS the assistant text in **clause-level chunks** as the chat stream emits, instead of waiting for full completion. (Implemented in v0.2 roadmap.)

## Token-consumption forecast methodology

Numbers in the README are projected from per-feature averages, not theoretical max:

| Feature | Tokens/call (median) | Calls/user/day |
|---------|---------------------|----------------|
| Tutor full-context | ~6,000 | 3 |
| Tutor follow-up | ~1,500 | 8 |
| Guardian scam analysis | ~3,500 | 4 |
| Advisor margin calc | ~2,500 | 6 |
| Advisor struk OCR | ~5,000 | 2 |
| TTS replies | ~800 | 18 |
| ASR inputs | ~1,200 | 18 |

Total per active user per day: **~95K tokens** (Pro pricing equivalent). At 1,000 active users × 30 days = **2.85B tokens/month** end-user. Plus dev/QA + SDK community = the headline 100B/month figure.

These are **sustained engagement projections**, not benchmark inflations.
