/**
 * Minimal SSE parser. Yields each `data:` payload as a string.
 *
 * We intentionally avoid pulling a 3rd-party SSE lib so the SDK runs in
 * any modern runtime (Node 18+, Bun, Deno, edge workers) with zero deps.
 */
export async function* parseSSE(stream: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx;
      // Events are separated by blank lines.
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const raw = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        for (const line of raw.split('\n')) {
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (payload === '[DONE]') return;
          if (payload) yield payload;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
