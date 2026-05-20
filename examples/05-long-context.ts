/**
 * MiMo Forge SDK — long-context document Q&A
 *
 * Demonstrates V2.5 base 1M-context window. Loads a long Indonesian
 * regulatory document (e.g. UU OJK 4/2023) and asks targeted questions.
 *
 * Run:
 *   MIMO_API_KEY=mm-... node --experimental-strip-types examples/05-long-context.ts ./samples/uu-ojk.txt
 */
import { readFileSync } from 'node:fs';
import { MimoForge } from '@mimoforge/sdk';

const docPath = process.argv[2];
if (!docPath) {
  console.error('usage: 05-long-context.ts <path-to-document.txt>');
  process.exit(1);
}

const mimo = new MimoForge({ apiKey: process.env.MIMO_API_KEY! });
const doc = readFileSync(docPath, 'utf-8');
console.log(`Loaded ${doc.length.toLocaleString()} chars`);

const reply = await mimo.chat.complete(
  [
    {
      role: 'system',
      content: 'Kamu konsultan hukum & fintech Indonesia. Jawab berdasarkan dokumen yang diberi saja.',
    },
    {
      role: 'user',
      content:
        `Dokumen referensi:\n\n${doc}\n\n` +
        `Pertanyaan: Apa kewenangan utama OJK terhadap koperasi simpan-pinjam ` +
        `setelah UU PPSK 4/2023? Berikan rangkuman 5 poin dengan kutipan pasal.`,
    },
  ],
  { enable_long_context: true, model: 'mimo-v2.5' }
);

console.log(reply.choices[0].message.content);
console.log('Tokens used:', reply.usage);
