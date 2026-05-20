# Bahasa Buddy

> Voice-first Indonesian AI companion. Three personas, one app, four MiMo models working together.

```bash
cp ../../.env.example ../../.env.local
# fill in MIMO_API_KEY from https://platform.xiaomimimo.com/

cd ../..
npm install
npm run build:sdk
npm run dev:bahasa
# → http://localhost:3001
```

## Personas

| Emoji | Name | Tagline | Voice | Model defaults |
|-------|------|---------|-------|----------------|
| 🌸 | Bu Riri | Tutor sabar untuk PR | `mimo:tts:id-female-young` | Pro + 1M context |
| 🛡️ | Pak Budi | Penjaga dari scam | `mimo:tts:id-male-warm` | Pro |
| 💼 | Mbak Ina | Penasihat UMKM | `mimo:tts:id-female-calm` | Pro + 1M context |

## Routes

```
src/app/
├── page.tsx                 Landing — hero, 3 persona cards, capabilities
├── chat/[persona]/page.tsx  Streaming chat UI with voice + image upload
├── api/chat/route.ts        SSE streaming chat
├── api/tts/route.ts         Voice synthesis
└── api/asr/route.ts         Speech recognition
```

## Demo flow

1. Open `/` — pick a persona
2. Send a text message OR record voice OR attach a photo
3. Watch reply stream in token-by-token
4. Tap "Putar suara" to hear the persona speak the reply

## Notes for judges

- **Server-only API key** — `MIMO_API_KEY` never leaves the server
- **Edge-safe SDK** — wraps `fetch` with zero deps; works in Vercel Edge / Cloudflare Workers
- **Bahasa-tuned prompts** — `src/personas/index.ts` is the soul of the app

## License

MIT
