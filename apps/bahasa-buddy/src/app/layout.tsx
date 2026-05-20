import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bahasa Buddy — AI Companion Bahasa Indonesia',
  description:
    'Asisten suara Bahasa Indonesia bertenaga Xiaomi MiMo. Tutor, penjaga scam, penasihat UMKM. Multimodal, voice in/out, untuk semua kalangan.',
  keywords: ['MiMo', 'Xiaomi', 'Bahasa Indonesia', 'AI', 'Voice Assistant'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body className="font-sans antialiased min-h-screen">{children}</body>
    </html>
  );
}
