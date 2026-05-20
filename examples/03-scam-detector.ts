/**
 * MiMo Forge SDK — multimodal scam-detection example
 *
 * Loads a screenshot of a suspicious WhatsApp message and asks MiMo
 * V2.5 to classify it. Demonstrates real-world Indonesian scam guardrails.
 *
 * Run:
 *   MIMO_API_KEY=mm-... node --experimental-strip-types examples/03-scam-detector.ts ./samples/wa-undian.png
 */
import { readFileSync } from 'node:fs';
import { MimoForge } from '@mimoforge/sdk';

const path = process.argv[2];
if (!path) {
  console.error('usage: 03-scam-detector.ts <path-to-screenshot>');
  process.exit(1);
}

const mimo = new MimoForge({ apiKey: process.env.MIMO_API_KEY! });
const buf = readFileSync(path);
const dataUrl = `data:image/png;base64,${buf.toString('base64')}`;

const out = await mimo.multimodal.describe({
  text:
    'Ini screenshot WhatsApp yang masuk ke nomor saya. Apakah ini penipuan? ' +
    'Kalau iya, modus apa, berapa skor risiko 0-10, dan apa langkah pertama yang harus saya lakukan?',
  images: [dataUrl],
  system:
    'Kamu detektif scam Bahasa Indonesia. Format jawaban: ' +
    'Verdict (AMAN/WASPADA/BAHAYA), Modus, Risiko (0-10), Langkah pertama.',
});

console.log(out.choices[0].message.content);
