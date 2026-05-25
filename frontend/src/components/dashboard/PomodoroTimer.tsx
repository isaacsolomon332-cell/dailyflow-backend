'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/lib/theme';

type Mode = 'work' | 'short' | 'long';

const modes: Record<Mode, { label: string; minutes: number; color: string }> = {
  work: { label: 'Focus', minutes: 25, color: '#6366f1' },
  short: { label: 'Short Break', minutes: 5, color: '#10b981' },
  long: { label: 'Long Break', minutes: 15, color: '#f59e0b' },
};

export default function PomodoroTimer() {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('work');
  const [seconds, setSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setSeconds(modes[mode].minutes * 60);
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [mode]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            if (mode === 'work') setSessions(s => s + 1);
            playSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const playSound = () => {
    try {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  const reset = () => {
    setIsRunning(false);
    setSeconds(modes[mode].minutes * 60);
  };

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const totalSeconds = modes[mode].minutes * 60;
  const progress = ((totalSeconds - seconds) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const color = modes[mode].color;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: 80, right: 20,
          width: 52, height: 52, borderRadius: '50%',
          background: isRunning ? color : isDark ? '#1e293b' : 'white',
          border: `2px solid ${isRunning ? color : isDark ? '#334155' : '#e5e7eb'}`,
          boxShadow: isRunning
            ? `0 4px 20px ${color}50`
            : '0 4px 16px rgba(0,0,0,0.1)',
          cursor: 'pointer', zIndex: 90,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}>
        {isRunning ? (
          <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>
            {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={isDark ? '#94a3b8' : '#6b7280'} strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        )}
      </button>

      {/* Timer panel */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 144, right: 20,
          width: 280, borderRadius: 20,
          background: isDark ? '#1e293b' : 'white',
          border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
          zIndex: 90, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827', margin: 0 }}>
                Pomodoro Timer
              </h3>
              <p style={{ fontSize: 11, color: isDark ? '#64748b' : '#9ca3af', margin: '2px 0 0' }}>
                {sessions} session{sessions !== 1 ? 's' : ''} completed
              </p>
            </div>
            <button onClick={() => setIsOpen(false)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: isDark ? '#64748b' : '#9ca3af', padding: 4,
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Mode selector */}
          <div style={{
            display: 'flex', gap: 4, padding: '12px 16px 0',
          }}>
            {(Object.entries(modes) as [Mode, typeof modes[Mode]][]).map(([key, val]) => (
              <button key={key} onClick={() => setMode(key)}
                style={{
                  flex: 1, padding: '6px 4px', borderRadius: 8, border: 'none',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  background: mode === key ? val.color : isDark ? '#0f172a' : '#f9fafb',
                  color: mode === key ? 'white' : isDark ? '#64748b' : '#9ca3af',
                  transition: 'all 0.15s',
                }}>
                {val.label}
              </button>
            ))}
          </div>

          {/* Timer circle */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', padding: '20px 16px',
          }}>
            <div style={{ position: 'relative', width: 130, height: 130 }}>
              <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="65" cy="65" r="54"
                  fill="none"
                  stroke={isDark ? '#334155' : '#f3f4f6'}
                  strokeWidth="8" />
                <circle cx="65" cy="65" r="54"
                  fill="none"
                  stroke={color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: 28, fontWeight: 700, letterSpacing: '-1px',
                  color: isDark ? '#f1f5f9' : '#111827',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 11, color: color, fontWeight: 600, marginTop: 2 }}>
                  {modes[mode].label}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'center' }}>
              <button onClick={reset}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                  background: isDark ? '#0f172a' : '#f9fafb',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: isDark ? '#64748b' : '#9ca3af',
                }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 1 0 .49-3.86"/>
                </svg>
              </button>

              <button onClick={() => setIsRunning(!isRunning)}
                style={{
                  width: 56, height: 56, borderRadius: '50%',
                  border: 'none', background: color,
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 4px 16px ${color}50`,
                  transition: 'all 0.15s',
                }}>
                {isRunning ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"
                    stroke="white" strokeWidth="2" strokeLinecap="round">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"
                    stroke="white" strokeWidth="2" strokeLinecap="round">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                )}
              </button>

              <button onClick={() => setSessions(0)}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                  background: isDark ? '#0f172a' : '#f9fafb',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: isDark ? '#64748b' : '#9ca3af',
                  fontSize: 12, fontWeight: 700,
                }}>
                0
              </button>
            </div>
          </div>

          {/* Sessions dots */}
          <div style={{
            padding: '0 16px 16px',
            display: 'flex', justifyContent: 'center', gap: 6,
          }}>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: i < (sessions % 4) ? color : isDark ? '#334155' : '#e5e7eb',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}