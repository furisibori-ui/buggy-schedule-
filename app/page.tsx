'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
        <p className="text-[11px] tracking-[0.35em] text-gray-500 uppercase mb-1">社非公認</p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-wide">
          Cursorを趣味で導入する会
        </h1>
      </header>

      <section className="border-2 border-gray-200 rounded-2xl p-10 bg-white shadow-lg shadow-gray-200/80">
        <h2 className="text-gold text-xl font-semibold mb-8 tracking-wider">イベント一覧</h2>
        <ul className="list-none p-0 m-0 space-y-4">
          {events.map((ev) => (
            <li key={ev.id}>
              <Link
                href={`/event/${ev.slug}`}
                className="block py-5 px-6 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 hover:border-gold hover:bg-amber-50/50 transition-all text-lg font-medium no-underline"
              >
                {ev.name}
              </Link>
            </li>
          ))}
        </ul>
        {events.length === 0 && (
          <p className="text-gray-600 text-sm">イベントはまだありません。</p>
        )}
      </section>

      <div className="mt-8 text-center">
        <Link
          href="/create"
          className="inline-block px-4 py-2 text-sm text-gray-600 hover:text-gray-800 no-underline transition-colors"
        >
          新しいイベントを作成
        </Link>
      </div>
    </main>
  );
}
