import Link from 'next/link';
import { PERSONA_LIST } from '@/personas';
import { ArrowRight, Mic, Eye, MessageSquare, Volume2 } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-bb-border">
        <div className="absolute inset-0 bb-grad-orange opacity-10 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-bb-border bg-bb-surface text-xs text-bb-mute mb-6">
            <span className="w-2 h-2 rounded-full bg-bb-accent2 animate-pulse-soft" />
            Powered by Xiaomi MiMo V2.5
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Bahasa Buddy
          </h1>
          <p className="text-xl md:text-2xl text-bb-mute mt-4 max-w-2xl">
            Asisten suara Bahasa Indonesia untuk semua kalangan. Tutor sabar, penjaga keluarga dari scam, penasihat UMKM — dalam satu app, satu suara.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/chat/tutor"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bb-grad-orange text-white font-medium hover:opacity-90 transition"
            >
              Mulai ngobrol <ArrowRight size={18} />
            </Link>
            <Link
              href="#kemampuan"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-bb-border bg-bb-surface text-bb-ink hover:bg-bb-border transition"
            >
              Pelajari kemampuan
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Personas */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Tiga teman, satu app</h2>
        <p className="text-bb-mute mb-10 max-w-2xl">
          Setiap persona disesuaikan untuk segmen pengguna berbeda — gaya bahasa, suara, dan kedalaman jawaban semua diatur untuk konteks lokal.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {PERSONA_LIST.map((p) => (
            <Link
              key={p.id}
              href={`/chat/${p.id}`}
              className="group rounded-2xl border border-bb-border bg-bb-surface p-6 hover:border-bb-accent transition"
            >
              <div className="text-4xl mb-3">{p.emoji}</div>
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <p className="text-sm text-bb-accent mt-1">{p.tagline}</p>
              <p className="text-xs text-bb-mute mt-3">{p.segment}</p>
              <div className="mt-6 flex items-center gap-2 text-sm text-bb-ink group-hover:text-bb-accent transition">
                Mulai chat <ArrowRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section id="kemampuan" className="border-t border-bb-border bg-bb-surface/50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Empat model MiMo, satu pengalaman</h2>
          <p className="text-bb-mute mb-10 max-w-2xl">
            Bahasa Buddy memanfaatkan seluruh stack MiMo: reasoning, multimodal, ASR, dan TTS bekerja sama dalam tiap interaksi.
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: MessageSquare, title: 'Reasoning Pro', model: 'mimo-v2.5-pro', desc: 'Multi-step reasoning untuk soal pelajaran, analisis scam, hitung BEP UMKM.' },
              { icon: Eye, title: 'Multimodal', model: 'mimo-v2.5', desc: 'Foto buku, screenshot WA, struk, foto produk — semua bisa "dibaca".' },
              { icon: Mic, title: 'ASR', model: 'mimo-v2.5-asr', desc: 'Bicara campur Bahasa-Jawa-Sunda? Tetap dimengerti tanpa setup.' },
              { icon: Volume2, title: 'TTS', model: 'mimo-v2.5-tts', desc: 'Empat suara berbeda untuk tiap persona, balasan terdengar manusiawi.' },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-bb-border bg-bb-bg p-5">
                <c.icon className="text-bb-accent" size={22} />
                <h3 className="font-semibold mt-3">{c.title}</h3>
                <code className="text-xs text-bb-mute">{c.model}</code>
                <p className="text-sm text-bb-mute mt-2">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-bb-border">
        <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-bb-mute flex flex-wrap gap-4 justify-between">
          <span>© 2026 Bahasa Buddy — built with @mimoforge/sdk</span>
          <span>Open source · MIT</span>
        </div>
      </footer>
    </main>
  );
}
