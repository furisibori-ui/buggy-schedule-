'use client';

import { useState, useRef, useEffect } from 'react';

export function BGMPlayer() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      audio.currentTime = 0;
    } else {
      audio.play().catch((err) => console.error('BGM play failed:', err));
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 2147483647,
      }}
    >
      <button
        type="button"
        onClick={toggle}
        onTouchEnd={(e) => {
          e.preventDefault();
          toggle(e as unknown as React.MouseEvent);
        }}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          background: 'linear-gradient(135deg, #c9a227 0%, #d4af37 50%, #b8860b 100%)',
          color: '#000',
          border: '2px solid #d4af37',
          fontSize: 24,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}
        title={playing ? 'BGMを止める' : 'BGMを再生'}
      >
        {playing ? '♪' : '♫'}
      </button>
      <span style={{ display: 'block', fontSize: 10, color: '#d4af37', marginTop: 4, textAlign: 'center' }}>
        BGM
      </span>
      <audio ref={audioRef} src="/bgm.mp3" loop preload="auto" controls style={{ marginTop: 8, width: 200, height: 36 }} />
      <a
        href="/bgm.mp3"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'block', fontSize: 10, color: '#d4af37', marginTop: 4, textAlign: 'center' }}
      >
        別タブで再生
      </a>
    </div>
  );
}
