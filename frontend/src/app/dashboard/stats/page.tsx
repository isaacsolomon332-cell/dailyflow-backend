'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { loadData } from '@/lib/store';

function HeatMap({ isDark }: { isDark: boolean }) {
  const data = loadData();
  const today = new Date();
  const weeks = 26;
  const days = weeks * 7;

  const cells = Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayData = data.calendar[dateStr];
    const habitsDone = data.habits.filter(h => h.completedDates.includes(dateStr)).length;
    return { dateStr, habitsDone, dayData };
  });

  const getColor = (count: number) => {
    if (count === 0) return isDark ? '#1e293b' : '#f3f4f6';
    if (count === 1) return '#818cf8';
    if (count === 2) return '#6366f1';
    if (count === 3) return '#4f46e5';
    return '#3730a3';
  };

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  cells.forEach((cell, i) => {
    const month = new Date(cell.dateStr).getMonth();
    const col = Math.floor(i / 7);
    if (month !== lastMonth) {
      monthLabels.push({ label: months[month], col });
      lastMonth = month;
    }
  });

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ position: 'relative', paddingTop: 20 }}>
        {/* Month labels */}
        <div style={{ display: 'flex', position: 'absolute', top: 0, left: 0 }}>
          {monthLabels.map((m, i) => (
            <div key={i} style={{
              position: 'absolute', left: m.col * 14,
              fontSize: 10, color: isDark ? '#64748b' : '#9ca3af', fontWeight: 500,
            }}>
              {m.label}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'flex', gap: 2 }}>
          {Array.from({ length: weeks }, (_, w) => (
            <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Array.from({ length: 7 }, (_, d) => {
                const cell = cells[w * 7 + d];
                if (!cell) return <div key={d} style={{ width: 12, height: 12 }} />;
                return (
                  <div key={d}
                    title={`${cell.dateStr}: ${cell.habitsDone} habits`}
                    style={{
                      width: 12, height: 12, borderRadius: 3,
                      background: getColor(cell.habitsDone),
                      cursor: 'pointer', transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = '0.8'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = '1'}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
        <span style={{ fontSize: 11, color: isDark ? '#64748b' : '#9ca3af' }}>Less</span>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{
            width: 12, height: 12, borderRadius: 3,
            background: getColor(i),
            border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
          }} />
        ))}
        <span style={{ fontSize: 11, color: isDark ? '#64748b' : '#9ca3af' }}>More</span>
      </div>
    </div>
  );
}

type Tab = 'overview' | 'habits' | 'goals' | 'projects';

const weeklyData = [
  { day: 'Mon', hours: 6 },
  { day: 'Tue', hours: 8 },
  { day: 'Wed', hours: 5 },
  { day: 'Thu', hours: 9 },
  { day: 'Fri', hours: 7 },
  { day: 'Sat', hours: 4 },
  { day: 'Sun', hours: 3 },
];

const maxHours = Math.max(...weeklyData.map(d => d.hours));

const monthlyStats = [
  { label: 'Study Hours', value: 0, unit: 'hrs', color: '#6366f1', max: 100 },
  { label: 'Tasks Done', value: 0, unit: '', color: '#10b981', max: 50 },
  { label: 'Habits Kept', value: 0, unit: '%', color: '#f59e0b', max: 100 },
  { label: 'Goals Done', value: 0, unit: '%', color: '#8b5cf6', max: 100 },
];

const streakItems = [
  { label: 'Current Streak', value: '0 days', icon: '🔥' },
  { label: 'Longest Streak', value: '0 days', icon: '⚡' },
  { label: 'Total Active Days', value: '0 days', icon: '📅' },
  { label: 'Habits Completed', value: '0 total', icon: '✓' },
];

const tabs: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'habits', label: 'Habits' },
  { key: 'goals', label: 'Goals' },
  { key: 'projects', label: 'Projects' },
];

export default function StatsPage() {
  const [isMobile, setIsMobile] = useState(false);
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div style={{ maxWidth: 1200 }}>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: isMobile ? 16 : 24,
        background: isDark ? '#1e293b' : 'white', borderRadius: 12, padding: 6,
        border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`, overflowX: 'auto',
      }}>
        {tabs.map(tab => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: isMobile ? 'none' : 1,
              padding: isMobile ? '8px 14px' : '9px 16px',
              borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
              background: activeTab === tab.key ? '#6366f1' : 'transparent',
              color: activeTab === tab.key ? 'white' : '#6b7280',
              transition: 'all 0.15s',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div>
          {/* Monthly stats cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: isMobile ? 10 : 16,
            marginBottom: isMobile ? 16 : 24,
          }}>
            {monthlyStats.map(s => (
              <div key={s.label} style={{
                background: isDark ? '#1e293b' : 'white', borderRadius: 12,
                padding: isMobile ? '14px' : '20px',
                border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
              }}>
                <p style={{
                  fontSize: 12, color: '#9ca3af',
                  margin: '0 0 8px', fontWeight: 500,
                }}>
                  {s.label}
                </p>
                <p style={{
                  fontSize: isMobile ? 24 : 28, fontWeight: 700,
                  color: isDark ? '#f1f5f9' : '#111827', margin: '0 0 12px',
                  letterSpacing: '-0.5px',
                }}>
                  {s.value}{s.unit}
                </p>
                <div style={{
                  height: 4, borderRadius: 999,
                  background: '#f3f4f6', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 999,
                    width: `${(s.value / s.max) * 100}%`,
                    background: s.color,
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Weekly chart */}
          <div style={{
            background: isDark ? '#1e293b' : 'white', borderRadius: 12,
            padding: isMobile ? '16px' : '24px',
            border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
            marginBottom: isMobile ? 16 : 24,
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 20,
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#f1f5f9' : '#111827', margin: 0 }}>
                Weekly Activity
              </h3>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>This week</span>
            </div>

            <div style={{
              display: 'flex', alignItems: 'flex-end',
              gap: isMobile ? 8 : 16, height: 120,
              paddingBottom: 28, position: 'relative',
            }}>
              {[0, 33, 66, 100].map(p => (
                <div key={p} style={{
                  position: 'absolute', left: 0, right: 0,
                  bottom: `calc(${p}% + 24px)`,
                  borderTop: '1px dashed #f3f4f6', zIndex: 0,
                }} />
              ))}

              {weeklyData.map((d, i) => {
                const isToday = i === todayIndex;
                return (
                  <div key={d.day} style={{
                    flex: 1, display: 'flex',
                    flexDirection: 'column', alignItems: 'center',
                    gap: 6, position: 'relative', zIndex: 1,
                  }}>
                    <div style={{
                      width: '100%', borderRadius: '4px 4px 0 0',
                      height: `${(d.hours / maxHours) * 96}px`,
                      background: isToday
                        ? 'linear-gradient(180deg, #6366f1, #a855f7)'
                        : '#e0e7ff',
                      minHeight: 4,
                    }} />
                    <span style={{
                      fontSize: 11,
                      fontWeight: isToday ? 700 : 400,
                      color: isToday ? '#6366f1' : '#9ca3af',
                    }}>
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: 3,
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                }} />
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Today</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: 3,
                  background: '#e0e7ff',
                }} />
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Other days</span>
              </div>
            </div>
          </div>

          {/* Bottom grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 12 : 16,
          }}>
            {/* Productivity score */}
            <div style={{
              background: isDark ? '#1e293b' : 'white', borderRadius: 12,
              padding: isMobile ? '16px' : '24px',
              border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
            }}>
              <h3 style={{
                fontSize: 14, fontWeight: 600,
                color: isDark ? '#f1f5f9' : '#111827', margin: '0 0 16px',
              }}>
                Productivity Score
              </h3>
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', padding: '16px 0',
              }}>
                <div style={{ position: 'relative' }}>
                  <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="60" cy="60" r="50"
                      fill="none" stroke="#f3f4f6" strokeWidth="10" />
                    <circle cx="60" cy="60" r="50"
                      fill="none" stroke="#6366f1" strokeWidth="10"
                      strokeDasharray="0 314"
                      strokeLinecap="round" />
                  </svg>
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                  }}>
                    <div style={{
                      fontSize: 24, fontWeight: 700,
                      color: isDark ? '#f1f5f9' : '#111827', letterSpacing: '-0.5px',
                    }}>
                      0
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>/ 100</div>
                  </div>
                </div>
              </div>
              <p style={{
                textAlign: 'center', fontSize: 13,
                color: '#9ca3af', margin: 0,
              }}>
                Start logging to build your score
              </p>
            </div>

            {/* Streak summary */}
            <div style={{
              background: isDark ? '#1e293b' : 'white', borderRadius: 12,
              padding: isMobile ? '16px' : '24px',
              border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
            }}>
              <h3 style={{
                fontSize: 14, fontWeight: 600,
                color: isDark ? '#f1f5f9' : '#111827', margin: '0 0 16px',
              }}>
                Streak Summary
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {streakItems.map(item => (
                  <div key={item.label} style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 10,
                    background: isDark ? '#0f172a' : '#f9fafb', border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
                        {item.label}
                      </span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'habits' && (
        <div style={{
          background: isDark ? '#1e293b' : 'white', borderRadius: 12,
          padding: isMobile ? '16px' : '24px',
          border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
          marginBottom: 16,
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#f1f5f9' : '#111827', margin: '0 0 16px' }}>
            Habit Activity Heatmap
          </h3>
          <HeatMap isDark={isDark} />
        </div>
      )}

      {activeTab !== 'overview' && activeTab !== 'habits' && (
        <div style={{
          background: isDark ? '#1e293b' : 'white', borderRadius: 12,
          padding: '60px 20px', border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
          textAlign: 'center',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: isDark ? '#0f172a' : '#f9fafb', border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#d1d5db" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#6b7280', margin: '0 0 4px' }}>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Statistics
          </p>
          <p style={{ fontSize: 13, color: '#d1d5db', margin: 0 }}>
            Add some {activeTab} to see your statistics here
          </p>
        </div>
      )}
    </div>
  );
}