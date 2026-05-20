# MiMo Forge

> **Open-source TypeScript SDK + flagship product for the Xiaomi MiMo ecosystem.**
> Built for the **MiMo Orbit 100 Trillion Token** Creator Incentive Program.

[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.17-blue)](https://nodejs.org)
[![Powered by](https://img.shields.io/badge/powered%20by-Xiaomi%20MiMo-ff6b35)](https://platform.xiaomimimo.com)

---

## Why MiMo Forge

The MiMo platform exposes four world-class models — **V2.5-Pro** (long-horizon agentic reasoning), **V2.5** (1M-context multimodal), **V2.5-TTS** (voice cloning), and **V2.5-ASR** (state-of-the-art speech recognition). Most developers use one. **MiMo Forge unlocks all four**, then proves the value with a flagship app that solves a real Indonesian problem.

This monorepo contains:

| Package | Purpose |
|---------|---------|
| **[`@mimoforge/sdk`](./packages/sdk)** | Unified TypeScript SDK — chat, multimodal, TTS, ASR. Zero dependencies. Edge-runtime safe. |
| **[`bahasa-buddy`](./apps/bahasa-buddy)** | Voice-first Indonesian companion app — three personas (tutor / scam guardian / UMKM advisor). Showcases full MiMo stack. |
| **[`examples/`](./examples)** | Five runnable scripts: chat, streaming, scam detection, voice loop, long-context Q&A. |

---

## The flagship: Bahasa Buddy

**Three AI companions, one app, one voice — for 280 million Indonesians.**

| Persona | Segment | Use case |
|---------|---------|----------|
| 🌸 **Bu Riri** — sabar, jelas, ramah anak | SD–SMA | PR, soal bahasa, IPA, IPS. Foto buku → langsung dijelaskan. |
| 🛡️ **Pak Budi** — empatik, tegas | Lansia & ibu rumah tangga | Cek pesan WhatsApp / SMS / OTP / panggilan suspicious. AMAN / WASPADA / BAHAYA. |
| 💼 **Mbak Ina** — profesional, hangat | Pekerja & UMKM | HPP, margin, pajak UMKM, foto struk → ekstrak angka. |

**Each interaction taps the full MiMo stack:**

```
Voice in (Bahasa+Jawa+Sunda) → ASR (mimo-v2.5-asr)
              ↓
       Reasoning multi-step → Pro (mimo-v2.5-pro)
              ↓
   Vision (foto buku/struk/WA) → Multimodal (mimo-v2.5)
              ↓
      Voice out (4 voices)    → TTS (mimo-v2.5-tts)
```

---

## Why this deserves a Token Plan

### 1. Strategic alignment with Xiaomi
- Indonesia = Xiaomi's #2 market by smartphone shipments. 280M+ population, 213M+ internet users, 130M+ daily WhatsApp users.
- Bahasa Indonesia is **chronically underserved by AI** — Western LLMs miss code-switching (Bahasa + Jawa + Sunda + Quranic phrases), local scam modus, UMKM tax structure.
- MiMo Forge plants the MiMo flag in this market **before DeepSeek / Qwen / Kimi do**.

### 2. Ecosystem multiplier — not just one app
The SDK is the leverage. Every dev who imports `@mimoforge/sdk` calls MiMo. Every reference example in this repo is a recruiting tool for new MiMo developers.

### 3. Honest token-consumption forecast
We're not asking for tokens to sit in inventory. Here's what real usage looks like:

| Workload | Daily/user | Justification |
|----------|-----------|---------------|
| **Bu Riri (Tutor)** | ~18M tokens | 1M-context book ingestion + multi-step reasoning per question + TTS for answers |
| **Pak Budi (Guardian)** | ~12M tokens | 5-pass multimodal scam analysis × 30 messages/day + warning TTS |
| **Mbak Ina (Advisor)** | ~24M tokens | Long-context UMKM history + multimodal struk parsing + cashflow reasoning |
| **SDK community usage** | ~50M tokens | Reference examples, docs interactive playground, third-party apps |

**At 1,000 active users** (modest pilot scale): ~50B tokens/month operational + 50B tokens dev/QA = **~100B tokens/month**.

This is sustainable consumption that grows the MiMo footprint, not throwaway burn.

### 4. Open-source from day one
Full MIT license. SDK published to npm. Bahasa Buddy app deployable to Vercel in one click. Every line of MiMo API integration code is public for other devs to learn from.

### 5. Built with MiMo-compatible tooling
Developed using **Claude Code** + **Cursor** + the **OpenClaw** workflow — exactly the tools MiMo's Token Plan promotes. The SDK is itself one of those tools (it's how Cursor / Claude Code can talk to MiMo through one import).

---

## Quick start

### SDK only

```bash
npm install @mimoforge/sdk
```

```ts
import { MimoForge } from '@mimoforge/sdk';

const mimo = new MimoForge({ apiKey: process.env.MIMO_API_KEY! });

const reply = await mimo.chat.complete([
  { role: 'user', content: 'Halo, apa kabar?' },
]);

console.log(reply.choices[0].message.content);
```

### Bahasa Buddy locally

```bash
git clone https://github.com/luckforme65-stack/mimo-forge.git
cd mimo-forge
npm install
cp .env.example .env.local       # fill in MIMO_API_KEY
npm run build:sdk
npm run dev:bahasa                # http://localhost:3001
```

---

## Repository layout

```
mimo-forge/
├── packages/
│   └── sdk/                          # @mimoforge/sdk
│       ├── src/
│       │   ├── core/                 # http client, sse parser, types
│       │   ├── chat/                 # mimo.chat.complete / .stream
│       │   ├── multimodal/           # mimo.multimodal.describe
│       │   ├── tts/                  # mimo.tts.speak / .stream + voices
│       │   └── asr/                  # mimo.asr.transcribe
│       └── test/                     # node:test, no dev runner needed
├── apps/
│   └── bahasa-buddy/                 # Next.js 16 flagship product
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx          # Landing — 3 personas + capabilities
│       │   │   ├── chat/[persona]/   # Streaming chat UI w/ voice + image
│       │   │   └── api/              # /api/chat, /api/tts, /api/asr
│       │   ├── lib/mimo.ts           # Server-only MimoForge singleton
│       │   └── personas/             # Tutor, Guardian, Advisor configs
│       └── tailwind.config.mjs
├── examples/                         # 5 standalone scripts
│   ├── 01-chat.ts
│   ├── 02-streaming.ts
│   ├── 03-scam-detector.ts
│   ├── 04-voice-loop.ts
│   └── 05-long-context.ts
└── docs/                             # extra docs (ARCHITECTURE, ROADMAP)
```

---

## Roadmap

- [x] SDK v0.1: chat, streaming, multimodal, TTS, ASR
- [x] Bahasa Buddy v0.1: 3 personas, voice loop, multimodal upload
- [ ] **v0.2** — voice cloning per family member (Pak Budi remembers Mom's voice for elderly comfort)
- [ ] **v0.3** — Bahasa Buddy WhatsApp Cloud API integration (no app install needed)
- [ ] **v0.4** — Mbak Ina TikTok Shop / Shopee scrape-and-analyse for UMKM
- [ ] **v0.5** — On-device Mi Smart Speaker integration

---

## Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| SDK | TypeScript + zero deps | Edge-safe, tiny bundle, `tsc` only |
| App | Next.js 16 + React 19 | Server-side streaming SSE, edge-friendly |
| Styling | Tailwind 3 | Fast iteration, no PostCSS pain |
| State | Zustand | One file, no Redux ceremony |
| Hosting | Vercel | One-click deploy, edge functions |

---

## License

MIT. Fork it, ship it, build the MiMo ecosystem.

---

**Built with 💚 by the MiMo Forge team — powered by Xiaomi MiMo V2.5.**
