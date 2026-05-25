'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadData, computeStats } from '@/lib/store';
import { useTheme } from '@/lib/theme';

function WeekCalendar({ isDark }: { isDark: boolean }) {
  const today = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return {
      day: days[i],
      date: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
      isPast: date < today && date.toDateString() !== today.toDateString(),
    };
  });

  const weekNumber = Math.ceil(
    (((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / 86400000) + 1) / 7
  );

  return (
    <div style={{
      background: isDark ? '#1e293b' : 'white',
      borderRadius: 12, padding: '16px',
      border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 14,
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#f1f5f9' : '#111827', margin: 0 }}>
          This Week
        </h3>
        <span style={{
          fontSize: 11, color: isDark ? '#64748b' : '#9ca3af', fontWeight: 500,
          background: isDark ? '#0f172a' : '#f9fafb',
          padding: '2px 7px', borderRadius: 5,
          border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
        }}>
          Week {weekNumber}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {weekDays.map((d) => (
          <div key={d.day} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 5,
          }}>
            <span style={{
              fontSize: 10, fontWeight: 500,
              color: d.isToday ? '#6366f1' : isDark ? '#64748b' : '#9ca3af',
              textTransform: 'uppercase',
            }}>
              {d.day[0]}
            </span>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: d.isToday ? 700 : 400,
              background: d.isToday ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'transparent',
              color: d.isToday ? 'white' : d.isPast ? (isDark ? '#475569' : '#d1d5db') : (isDark ? '#94a3b8' : '#374151'),
              border: d.isToday ? 'none' : `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
              cursor: 'pointer',
            }}>
              {d.date}
            </div>
            <div style={{
              width: 4, height: 4, borderRadius: '50%',
              background: d.isToday ? '#6366f1' : 'transparent',
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState(() => computeStats(loadData()));

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const refresh = () => setStats(computeStats(loadData()));
    window.addEventListener('dailyflow-update', refresh);
    return () => window.removeEventListener('dailyflow-update', refresh);
  }, []);

  const card = {
    background: isDark ? '#1e293b' : 'white',
    border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
  };

  const statCards = [
    {
      label: "Today's Progress",
      value: `${stats.todayProgress}%`,
      sub: `${stats.todayTasks} tasks complete`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      accent: '#6366f1',
      onClick: () => router.push('/dashboard/calendar'),
    },
    {
      label: 'Goals Achieved',
      value: `${stats.goalsProgress}%`,
      sub: `${stats.goalsCount} goals`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      ),
      accent: '#10b981',
      onClick: () => router.push('/dashboard/goals'),
    },
    {
      label: 'Active Projects',
      value: String(stats.activeProjects),
      sub: 'In progress',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      ),
      accent: '#8b5cf6',
      onClick: () => router.push('/dashboard/projects'),
    },
    {
      label: 'Study Hours',
      value: `${stats.studyHours}h`,
      sub: 'This month',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      accent: '#f59e0b',
      onClick: () => router.push('/dashboard/stats'),
    },
  ];

  const quickActions = [
    {
      label: 'Log Today',
      desc: 'Record your progress',
      onClick: () => router.push('/dashboard/calendar'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      ),
    },
    {
      label: 'New Goal',
      desc: 'Set an objective',
      onClick: () => router.push('/dashboard/goals'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      ),
    },
    {
      label: 'New Project',
      desc: 'Track a project',
      onClick: () => router.push('/dashboard/projects'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      ),
    },
    {
      label: 'New Habit',
      desc: 'Build consistency',
      onClick: () => router.push('/dashboard/habits'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="9 11 12 14 22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200 }}>

      {isMobile && (
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827', margin: '0 0 2px', letterSpacing: '-0.3px' }}>
            Overview
          </h2>
          <p style={{ fontSize: 13, color: isDark ? '#64748b' : '#9ca3af', margin: 0 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: isMobile ? 10 : 16,
        marginBottom: isMobile ? 16 : 24,
      }}>
        {statCards.map(s => (
          <div key={s.label}
            onClick={s.onClick}
            style={{
              ...card, borderRadius: 12,
              padding: isMobile ? '14px' : '20px',
              cursor: 'pointer', transition: 'box-shadow 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.06)'}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#6b7280', fontWeight: 500, lineHeight: 1.3 }}>
                {s.label}
              </span>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${s.accent}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {s.icon}
              </div>
            </div>
            <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827', letterSpacing: '-0.5px', marginBottom: 3 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: isDark ? '#64748b' : '#9ca3af' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        ...card, borderRadius: 12,
        padding: isMobile ? '14px' : '20px',
        marginBottom: isMobile ? 16 : 24,
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#f1f5f9' : '#111827', margin: `0 0 ${isMobile ? 12 : 14}px` }}>
          Quick Actions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? 8 : 10 }}>
          {quickActions.map(a => (
            <button key={a.label}
              onClick={a.onClick}
              style={{
                padding: isMobile ? '12px' : '14px',
                borderRadius: 10,
                border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
                background: isDark ? '#0f172a' : 'white',
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#6366f1';
                (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#1e293b' : '#fafafa';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = isDark ? '#334155' : '#f3f4f6';
                (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#0f172a' : 'white';
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: isDark ? '#1e293b' : '#f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#6366f1',
              }}>
                {a.icon}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#f1f5f9' : '#111827' }}>
                  {a.label}
                </div>
                {!isMobile && (
                  <div style={{ fontSize: 11, color: isDark ? '#64748b' : '#9ca3af', marginTop: 1 }}>
                    {a.desc}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 12 : 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 16 }}>

          {/* Recent Activity */}
          <div style={{ ...card, borderRadius: 12, padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#f1f5f9' : '#111827', margin: 0 }}>
                Recent Activity
              </h3>
              <button onClick={() => router.push('/dashboard/calendar')}
                style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                View all
              </button>
            </div>

            {stats.recentDays.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: isDark ? '#0f172a' : '#f9fafb',
                  border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#475569' : '#d1d5db'} strokeWidth="2" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <p style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#6b7280', margin: 0, fontWeight: 500 }}>No activity yet</p>
                <p style={{ fontSize: 12, color: isDark ? '#475569' : '#d1d5db', margin: 0 }}>Start by logging your day</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats.recentDays.map((day: any) => (
                  <div key={day.date} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: 8,
                    background: isDark ? '#0f172a' : '#f9fafb',
                    border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
                  }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#f1f5f9' : '#111827', margin: 0 }}>
                        {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p style={{ fontSize: 11, color: isDark ? '#64748b' : '#9ca3af', margin: '1px 0 0' }}>
                        {day.actualHours}h logged · {day.tasks?.filter((t: any) => t.completed).length || 0}/{day.tasks?.length || 0} tasks
                      </p>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                      background: day.status === 'completed' ? '#ecfdf5' : day.status === 'missed' ? '#fef2f2' : day.status === 'inprogress' ? '#fffbeb' : '#eef2ff',
                      color: day.status === 'completed' ? '#10b981' : day.status === 'missed' ? '#ef4444' : day.status === 'inprogress' ? '#f59e0b' : '#6366f1',
                    }}>
                      {day.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <WeekCalendar isDark={isDark} />
        </div>

        {/* Upcoming Deadlines */}
        {!isMobile && (
          <div style={{ ...card, borderRadius: 12, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#f1f5f9' : '#111827', margin: 0 }}>
                Upcoming Deadlines
              </h3>
              <button onClick={() => router.push('/dashboard/goals')}
                style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                View all
              </button>
            </div>

            {stats.upcoming.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: isDark ? '#0f172a' : '#f9fafb',
                  border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#475569' : '#d1d5db'} strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="6"/>
                    <circle cx="12" cy="12" r="2"/>
                  </svg>
                </div>
                <p style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#6b7280', margin: 0, fontWeight: 500 }}>No deadlines</p>
                <p style={{ fontSize: 12, color: isDark ? '#475569' : '#d1d5db', margin: 0 }}>Add goals to track deadlines</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stats.upcoming.map((goal: any) => {
                  const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={goal.id} style={{
                      padding: '12px 14px', borderRadius: 10,
                      background: isDark ? '#0f172a' : '#f9fafb',
                      border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#f1f5f9' : '#111827', margin: 0 }}>
                          {goal.title}
                        </p>
                        <span style={{
                          fontSize: 11, fontWeight: 700,
                          color: daysLeft < 3 ? '#ef4444' : daysLeft < 7 ? '#f59e0b' : isDark ? '#94a3b8' : '#6b7280',
                          whiteSpace: 'nowrap', marginLeft: 8,
                        }}>
                          {daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                        </span>
                      </div>
                      <div style={{ height: 4, borderRadius: 999, background: isDark ? '#334155' : '#e5e7eb', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 999, width: `${goal.progress}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)' }} />
                      </div>
                      <p style={{ fontSize: 11, color: isDark ? '#64748b' : '#9ca3af', margin: '4px 0 0' }}>
                        {goal.progress}% complete
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}