'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function CreatePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [datesText, setDatesText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const dates = datesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!name.trim()) {
      setError('イベント名を入力してください');
      return;
    }
    if (dates.length === 0) {
      setError('日程候補を1つ以上入力してください');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), dates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '作成に失敗しました');
      router.push(`/event/${data.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-16 px-6 sm:px-12 max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gold-light text-sm no-underline hover:text-gold mb-12"
      >
        ← トップへ
      </Link>

      <header className="mb-12">
        <Image src="/logo.png" alt="ロゴ" width={280} height={84} className="mb-6 mix-blend-lighten" />
        <h1 className="text-2xl text-gold font-medium">新しいイベントを作成</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-gold-light/90 text-sm mb-2">① イベント名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full max-w-md px-5 py-4 bg-luxury-card border border-luxury-border rounded-lg text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none"
            placeholder="例：地域趣味のつどい 日程調整"
          />
        </div>

        <div>
          <label className="block text-gold-light/90 text-sm mb-2">
            ② 日程候補（1行に1つ入力）
          </label>
          <p className="text-gray-500 text-xs mb-2">参加者に選んでもらいたい日時を、改行で区切って入力してください</p>
          <textarea
            value={datesText}
            onChange={(e) => setDatesText(e.target.value)}
            rows={6}
            className="w-full max-w-md px-5 py-4 bg-luxury-card border border-luxury-border rounded-lg text-white placeholder-gray-500 resize-y focus:border-gold/50 focus:outline-none"
            placeholder={'例：\n2/28 10:00\n2/28 14:00\n3/1 10:00'}
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-4 gold-bg text-black font-medium rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {loading ? '作成中...' : '作成する'}
        </button>
      </form>
    </main>
  );
}
