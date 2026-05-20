/**
 * MiMo Forge SDK — basic chat example
 *
 * Run:
 *   MIMO_API_KEY=mm-... node --experimental-strip-types examples/01-chat.ts
 */
import { MimoForge } from '@mimoforge/sdk';

const mimo = new MimoForge({ apiKey: process.env.MIMO_API_KEY! });

const reply = await mimo.chat.complete([
  { role: 'system', content: 'Kamu asisten Bahasa Indonesia yang ramah.' },
  {
    role: 'user',
    content: 'Apa bedanya investasi reksadana sama saham? Jelaskan singkat ya.',
  },
]);

console.log(reply.choices[0].message.content);
console.log('---');
console.log('Tokens:', reply.usage);
