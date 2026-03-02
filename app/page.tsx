'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Event = {
  id: number;
  slug: string;
  name: string;
  dates: string[];
  created_at: string;
};

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]));
  }, []);

  return (
    <main className="min-h-screen py-16 px-6 sm:px-12 max-w-4xl mx-auto">
      <header className="text-center mb-8">
        <Image
          src="/logo.png"
          alt="趣味でCursorさわってみる会"
          width={560}
          height={168}
          className="mx-auto mix-blend-lighten"
          priority
        />
      </header>

      <section className="border-2 border-gold/40 rounded-2xl p-10 bg-luxury-card/70 backdrop-blur-xl shadow-[0_0_40px_rgba(212,175,55,0.15)]">
        <h2 className="text-gold text-xl font-semibold mb-8 tracking-wider">イベント一覧</h2>
        <ul className="list-none p-0 m-0 space-y-4">
          {events.map((ev) => (
            <li key={ev.id}>
              <Link
                href={`/event/${ev.slug}`}
                className="block py-5 px-6 rounded-xl bg-luxury-dark/90 border-2 border-luxury-border hover:border-gold/60 hover:bg-luxury-card hover:shadow-lg transition-all text-white text-lg font-medium no-underline"
              >
                {ev.name}
              </Link>
            </li>
          ))}
        </ul>
        {events.length === 0 && (
          <p className="text-gray-500 text-sm">イベントはまだありません。</p>
        )}
      </section>

      <div className="mt-8 text-center">
        <Link
          href="/create"
          className="inline-block px-4 py-2 text-sm text-gray-500 hover:text-gray-400 no-underline transition-colors"
        >
          新しいイベントを作成
        </Link>
      </div>
    </main>
  );
}
