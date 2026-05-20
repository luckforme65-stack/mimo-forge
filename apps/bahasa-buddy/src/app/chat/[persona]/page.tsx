'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Send, Mic, Image as ImageIcon, Volume2, Loader2, ArrowLeft, Square } from 'lucide-react';
import { PERSONAS, type PersonaId } from '@/personas';

interface Msg {
  role: 'user' | 'assistant';
  text: string;
  images?: string[];
}

export default function ChatPage() {
  const params = useParams<{ persona: string }>();
  const personaId = params.persona as PersonaId;
  const persona = PERSONAS[personaId];

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [audioReady, setAudioReady] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (persona && messages.length === 0) {
      setMessages([{ role: 'assistant', text: persona.greeting }]);
    }
  }, [persona, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  if (!persona) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Persona tidak ditemukan.</p>
      </div>
    );
  }

  async function send() {
    if (!input.trim() && pendingImages.length === 0) return;
    if (streaming) return;

    const userMsg: Msg = {
      role: 'user',
      text: input.trim() || '(gambar)',
      images: pendingImages.length > 0 ? pendingImages : undefined,
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setPendingImages([]);
    setStreaming(true);

    // Placeholder for assistant
    setMessages([...next, { role: 'assistant', text: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: personaId,
          messages: next.map((m) => ({ role: m.role, text: m.text, images: m.images })),
        }),
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf('\n\n')) !== -1) {
          const line = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') continue;
          try {
            const evt = JSON.parse(payload);
            if (evt.delta) {
              acc += evt.delta;
              setMessages((cur) => {
                const copy = [...cur];
                copy[copy.length - 1] = { role: 'assistant', text: acc };
                return copy;
              });
            }
          } catch {
            /* ignore heartbeat frames */
          }
        }
      }
    } catch (err) {
      setMessages((cur) => [
        ...cur.slice(0, -1),
        { role: 'assistant', text: `⚠️ Gagal menghubungi MiMo: ${(err as Error).message}` },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  async function speak(text: string) {
    if (!text) return;
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona: personaId, text }),
      });
      if (res.status === 503) {
        const j = await res.json();
        alert(j.message ?? 'Voice belum aktif untuk API key ini.');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioReady(url);
      const audio = new Audio(url);
      audio.play();
    } catch (err) {
      console.error('TTS error', err);
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunks.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await transcribeAndSend(blob);
      };
      mr.start();
      recorder.current = mr;
      setRecording(true);
    } catch (err) {
      console.error('record error', err);
    }
  }

  function stopRecording() {
    recorder.current?.stop();
    setRecording(false);
  }

  async function transcribeAndSend(blob: Blob) {
    setTranscribing(true);
    try {
      const fd = new FormData();
      fd.append('file', new File([blob], 'voice.webm', { type: 'audio/webm' }));
      fd.append('language', 'auto');
      const res = await fetch('/api/asr', { method: 'POST', body: fd });
      if (res.status === 503) {
        const j = await res.json();
        alert(j.message ?? 'Voice input belum aktif untuk API key ini.');
        return;
      }
      const data = await res.json();
      if (data.text) {
        setInput((prev) => (prev ? `${prev} ${data.text}` : data.text));
      }
    } catch (err) {
      console.error('asr error', err);
    } finally {
      setTranscribing(false);
    }
  }

  function pickFile() {
    fileInput.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPendingImages((prev) => [...prev, reader.result as string]);
      }
    };
    reader.readAsDataURL(f);
    e.target.value = '';
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-bb-border bb-glass sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-bb-mute hover:text-bb-ink"><ArrowLeft size={20} /></Link>
          <div className="text-3xl">{persona.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{persona.name}</div>
            <div className="text-xs text-bb-mute truncate">{persona.tagline}</div>
          </div>
          <div className="text-xs text-bb-mute hidden sm:block">{persona.segment}</div>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  m.role === 'user' ? 'bb-grad-orange text-white' : 'bg-bb-surface border border-bb-border'
                }`}
              >
                {m.images?.map((img, j) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={j} src={img} alt="" className="rounded-lg mb-2 max-h-48" />
                ))}
                <div className="whitespace-pre-wrap leading-relaxed text-sm">
                  {m.text || (m.role === 'assistant' && streaming ? '…' : '')}
                </div>
                {m.role === 'assistant' && m.text && !streaming && (
                  <button
                    onClick={() => speak(m.text)}
                    className="mt-2 text-xs text-bb-mute hover:text-bb-accent inline-flex items-center gap-1"
                  >
                    <Volume2 size={14} /> Putar suara
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Composer */}
      <footer className="border-t border-bb-border bg-bb-surface/80">
        <div className="max-w-3xl mx-auto px-4 py-3">
          {pendingImages.length > 0 && (
            <div className="flex gap-2 mb-2 overflow-x-auto">
              {pendingImages.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={img} alt="" className="h-16 w-16 rounded-lg object-cover" />
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
            <input ref={fileInput} type="file" accept="image/*" hidden onChange={onFile} />
            <button
              onClick={pickFile}
              className="p-3 rounded-full bg-bb-bg border border-bb-border hover:border-bb-accent text-bb-mute"
              title="Lampirkan gambar"
            >
              <ImageIcon size={18} />
            </button>
            <button
              onClick={recording ? stopRecording : startRecording}
              disabled={transcribing}
              className={`p-3 rounded-full border ${
                recording ? 'bg-bb-accent text-white border-bb-accent' : 'bg-bb-bg border-bb-border text-bb-mute hover:border-bb-accent'
              }`}
              title={recording ? 'Hentikan rekam' : 'Rekam suara'}
            >
              {transcribing ? <Loader2 size={18} className="animate-spin" /> : recording ? <Square size={18} /> : <Mic size={18} />}
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder={`Tanya ${persona.name}…`}
              className="flex-1 bg-bb-bg border border-bb-border rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-bb-accent"
            />
            <button
              onClick={send}
              disabled={streaming}
              className="p-3 rounded-full bb-grad-orange text-white disabled:opacity-50"
              title="Kirim"
            >
              {streaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
          <p className="text-[10px] text-bb-mute mt-2 text-center">
            Tekan Enter untuk kirim · Shift+Enter untuk baris baru · {persona.voiceId.split(':').pop()}
          </p>
        </div>
      </footer>
    </div>
  );
}
