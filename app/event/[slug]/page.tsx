'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

type Event = {
  id: number;
  slug: string;
  name: string;
  dates: string[];
  created_at: string;
};

type Response = {
  id: number;
  name: string;
  answers: Record<string, string>;
  created_at: string;
};

const CHOICES = [
  { value: '○', label: '参加可', color: 'bg-emerald-600/80 border-emerald-500' },
  { value: '△', label: '要相談', color: 'bg-amber-600/80 border-amber-500' },
  { value: '×', label: '不可', color: 'bg-gray-600/80 border-gray-500' },
] as const;

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [name, setName] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/events/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setEvent(data);
        const init: Record<string, string> = {};
        (data.dates || []).forEach((d: string) => (init[d] = ''));
        setAnswers(init);
      })
      .catch(() => setEvent(null));
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/events/${slug}/responses`)
      .then((r) => r.json())
      .then((data) => setResponses(Array.isArray(data) ? data : []))
      .catch(() => setResponses([]));
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('名前を入力してください');
      return;
    }
    const filled = Object.entries(answers).filter(([, v]) => v);
    if (filled.length === 0) {
      setError('少なくとも1つの日程に回答してください');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${slug}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '登録に失敗しました');
      setResponses((prev) => [...prev, data]);
      setName('');
      setAnswers((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => (next[k] = ''));
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!confirm('このイベントを削除しますか？')) return;
    try {
      const res = await fetch(`/api/events/${slug}`, { method: 'DELETE' });
      if (res.ok) router.push('/');
      else setError('削除に失敗しました');
    } catch {
      setError('削除に失敗しました');
    }
  };

  const handleDeleteDate = async (dateToRemove: string) => {
    if (!confirm(`「${dateToRemove}」を削除しますか？`)) return;
    try {
      const res = await fetch(`/api/events/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ removeDate: dateToRemove }),
      });
      if (res.ok) {
        setEvent((prev) =>
          prev
            ? { ...prev, dates: (prev.dates || []).filter((d) => d !== dateToRemove) }
            : null
        );
        setAnswers((prev) => {
          const next = { ...prev };
          delete next[dateToRemove];
          return next;
        });
      } else {
        const data = await res.json();
        setError(data.error || '削除に失敗しました');
      }
    } catch {
      setError('削除に失敗しました');
    }
  };

  const handleDeleteResponse = async (id: number) => {
    if (!confirm('この回答を削除しますか？')) return;
    try {
      const res = await fetch(`/api/events/${slug}/responses/${id}`, { method: 'DELETE' });
      if (res.ok) setResponses((prev) => prev.filter((r) => r.id !== id));
      else setError('削除に失敗しました');
    } catch {
      setError('削除に失敗しました');
    }
  };

  if (!event) {
    return (
      <main className="min-h-screen py-16 px-6 sm:px-12 max-w-4xl mx-auto">
        <p className="text-gray-500">読み込み中...</p>
      </main>
    );
  }

  const dates = Array.isArray(event.dates) ? event.dates : [];

  // ○が最も多い日を計算
  const maruCountByDate: Record<string, number> = {};
  dates.forEach((d) => (maruCountByDate[d] = 0));
  responses.forEach((r) => {
    dates.forEach((d) => {
      if (r.answers?.[d] === '○') maruCountByDate[d]++;
    });
  });
  const maxMaru = Math.max(...Object.values(maruCountByDate), 0);
  const bestDates = maxMaru > 0 ? dates.filter((d) => maruCountByDate[d] === maxMaru) : [];

  return (
    <main className="min-h-screen py-16 px-6 sm:px-12 max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gold-light text-sm no-underline hover:text-gold mb-12"
      >
        ← トップへ
      </Link>

      <header className="mb-12">
        <Image src="/logo.png" alt="ロゴ" width={240} height={72} className="mb-4 mix-blend-lighten" />
        <h1 className="text-2xl text-gold font-medium">{event.name}</h1>
      </header>

      {bestDates.length > 0 && (
        <section className="mb-8 p-6 rounded-xl border-2 border-gold/50 bg-gold/10">
          <h2 className="text-gold text-base font-semibold mb-2 tracking-wider">おすすめの日程</h2>
          <p className="text-white text-lg">
            {bestDates.join('、')}
            <span className="text-gold-light/80 text-sm ml-2">
              （○が{maxMaru}件）
            </span>
          </p>
        </section>
      )}

      <section className="mb-12">
        <h2 className="text-gold-light/90 text-base font-medium mb-6">
          {bestDates.length > 0 ? '日程候補（下記から選んで回答してください）' : '日程候補'}
        </h2>
        <ul className="list-none p-0 m-0 space-y-3">
          {dates.map((d) => (
            <li
              key={d}
              className={`py-4 px-6 rounded-lg border flex items-center justify-between ${
                bestDates.includes(d)
                  ? 'border-gold/50 bg-gold/5'
                  : 'border-luxury-border bg-luxury-card/50'
              }`}
            >
              <span>
                {bestDates.includes(d) && (
                  <span className="inline-block px-2 py-0.5 text-xs gold-bg text-black rounded mr-2 mb-1">
                    おすすめ
                  </span>
                )}
                {d}
              </span>
              <button
                type="button"
                onClick={() => handleDeleteDate(d)}
                className="text-red-400/70 hover:text-red-400 text-xs"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12 pt-8 border-t border-luxury-border bg-luxury-card/30 rounded-xl p-8 border border-luxury-border">
        <h2 className="text-gold text-lg font-medium mb-2 tracking-wider">回答する</h2>
        <p className="text-gold-light/80 text-sm mb-6">
          ① 名前を入力 → ② 各日程で ○参加可  △要相談  ×不可 を選んでください
        </p>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-gold-light/90 text-sm mb-2">① お名前</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full max-w-md px-5 py-4 bg-luxury-dark border border-luxury-border rounded-lg text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none"
              placeholder="例：山田 太郎"
            />
          </div>

          <div>
            <label className="block text-gold-light/90 text-sm mb-4">② 各日程の希望を選択</label>
            <div className="space-y-3">
              {dates.map((d) => (
                <div key={d} className="flex flex-wrap items-center gap-4 py-3 px-4 rounded-lg bg-luxury-dark/60 border border-luxury-border">
                  <span className="text-white font-medium min-w-[8rem]">{d}</span>
                  <div className="flex gap-2">
                    {CHOICES.map(({ value, label, color }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [d]: value }))}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          answers[d] === value
                            ? `${color} text-white`
                            : 'bg-luxury-card border-luxury-border text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        {value} {label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 gold-bg text-black font-medium rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {loading ? '送信中...' : '回答を登録'}
          </button>
        </form>
      </section>

      <section className="mt-16 pt-10 border-t border-luxury-border">
        <h2 className="text-gold-light/90 text-base font-medium mb-6">回答一覧</h2>
        <div className="overflow-x-auto rounded-xl border border-luxury-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-luxury-card">
                <th className="border-b border-luxury-border px-4 py-3 text-left text-gold-light/90 font-medium">
                  名前
                </th>
                {dates.map((d) => (
                  <th
                    key={d}
                    className={`border-b border-luxury-border px-4 py-3 text-left font-medium ${
                      bestDates.includes(d) ? 'text-gold' : 'text-gold-light/90'
                    }`}
                  >
                    {d}
                    {bestDates.includes(d) && (
                      <span className="text-xs ml-1">★</span>
                    )}
                  </th>
                ))}
                <th className="border-b border-luxury-border px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {responses.map((r) => (
                <tr key={r.id} className="border-b border-luxury-border last:border-0">
                  <td className="px-4 py-3 text-white">{r.name}</td>
                  {dates.map((d) => (
                    <td key={d} className="px-4 py-3">
                      <span
                        className={
                          r.answers?.[d] === '○'
                            ? 'text-emerald-400'
                            : r.answers?.[d] === '△'
                            ? 'text-amber-400'
                            : r.answers?.[d] === '×'
                            ? 'text-gray-400'
                            : 'text-gray-600'
                        }
                      >
                        {r.answers?.[d] ?? '-'}
                      </span>
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleDeleteResponse(r.id)}
                      className="text-red-400/70 hover:text-red-400 text-xs"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {responses.length === 0 && (
          <p className="text-gray-500 text-sm mt-6">まだ回答はありません。</p>
        )}
      </section>

      <div className="mt-12 pt-8 text-center">
        <button
          type="button"
          onClick={handleDeleteEvent}
          className="px-4 py-2 text-sm text-gray-500 hover:text-red-400 transition-colors"
        >
          イベントを削除
        </button>
      </div>
    </main>
  );
}
