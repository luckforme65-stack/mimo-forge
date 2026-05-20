/**
 * MiMo Forge SDK — ASR + reasoning + TTS round trip
 *
 * Loads an audio file (Bahasa Indonesia or code-switched), transcribes,
 * sends to V2.5-Pro, and synthesises the reply in a chosen voice.
 *
 * Run:
 *   MIMO_API_KEY=mm-... node --experimental-strip-types examples/04-voice-loop.ts ./samples/question.wav
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { MimoForge, BUILTIN_VOICES } from '@mimoforge/sdk';

const path = process.argv[2];
if (!path) {
  console.error('usage: 04-voice-loop.ts <path-to-audio>');
  process.exit(1);
}

const mimo = new MimoForge({ apiKey: process.env.MIMO_API_KEY! });

const audio = new Uint8Array(readFileSync(path));
const ext = path.split('.').pop() as 'wav' | 'mp3' | 'ogg' | 'm4a';

console.log('1/3  Transcribing…');
const t = await mimo.asr.transcribe(audio, ext, { language: 'auto' });
console.log('   →', t.text);

console.log('2/3  Reasoning…');
const reply = await mimo.chat.complete([
  { role: 'system', content: 'Kamu asisten Bahasa Indonesia. Jawab singkat dan ramah.' },
  { role: 'user', content: t.text },
]);
const text = reply.choices[0].message.content as string;
console.log('   →', text);

console.log('3/3  Synthesising voice…');
const audioOut = await mimo.tts.speak(text, { voice: BUILTIN_VOICES.budi });
writeFileSync('reply.mp3', Buffer.from(audioOut));
console.log('   → wrote reply.mp3');
