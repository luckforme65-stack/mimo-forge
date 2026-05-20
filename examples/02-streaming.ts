/**
 * MiMo Forge SDK — streaming chat example
 *
 * Run:
 *   MIMO_API_KEY=mm-... node --experimental-strip-types examples/02-streaming.ts
 */
import { MimoForge } from '@mimoforge/sdk';

const mimo = new MimoForge({ apiKey: process.env.MIMO_API_KEY! });

const stream = await mimo.chat.stream([
  { role: 'user', content: 'Tulis pantun 4 baris tentang Yogyakarta dan kopi pagi.' },
]);

for await (const delta of stream) {
  process.stdout.write(delta);
}
process.stdout.write('\n');
