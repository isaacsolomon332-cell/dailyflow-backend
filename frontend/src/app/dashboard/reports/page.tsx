'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { loadData } from '@/lib/store';

interface WeekReport {
  weekStart: string;
  weekEnd: string;
  habitsCompleted: number;
  habitTotal: number;
  goalsCompleted: number;
  goalTotal: number;
  projectsCompleted: number;
  projectTotal: number;
  daysLogged: number;
  totalHours: number;
  score: number;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function generateReports(data: any): WeekReport[] {
  const reports: WeekReport[] = [];
  const today = new Date();

  for (let w = 0; w < 8; w++) {
    const weekStart = getWeekStart(new Date(today));
    weekStart.setDate(weekStart.getDate() - w * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return formatDate(d);
    });

    const habitsCompleted = data.habits.reduce((sum: number, h: any) =>
      sum + weekDays.filter(d => h.completedDates.includes(d)).length, 0);
    const habitTotal = data.habits.length * 7;

    const daysLogged = weekDays.filter(d => data.calendar[d]).length;
    const totalHours = weekDays.reduce((sum: number, d: string) =>
      sum + (data.calendar[d]?.actualHours || 0), 0);

    const goalsCompleted = data.goals.filter((g: any) => g.status === 'completed').length;
    const projectsCompleted = data.projects.filter((p: any) => p.status === 'completed').length;

    const score = Math.round(
      (habitTotal > 0 ? (habitsCompleted / habitTotal) * 40 : 0) +
      (daysLogged / 7) * 40 +
      Math.min(totalHours / 40, 1) * 20
    );

    reports.push({
      weekStart: formatDate(weekStart),
      weekEnd: formatDate(weekEnd),
      habitsCompleted,
      habitTotal,
      goalsCompleted,
      goalTotal: data.goals.length,
      projectsCompleted,
      projectTotal: data.projects.length,
      daysLogged,
      totalHours,
      score,
    });
  }

  return reports;
}

function getScoreColor(score: number) {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#6366f1';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

function getScoreLabel(score: number) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Work';
}

export default function ReportsPage() {
  const { isDark } = useTheme();
  const [data, setData] = useState(() => loadData());
  const [reports, setReports] = useState<WeekReport[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const d = loadData();
    setData(d);
    setReports(generateReports(d));
  }, []);

  useEffect(() => {
    const refresh = () => {
      const d = loadData();
      setData(d);
      setReports(generateReports(d));
    };
    window.addEventListener('dailyflow-update', refresh);
    return () => window.removeEventListener('dailyflow-update', refresh);
  }, []);

  const card = {
    background: isDark ? '#1e293b' : 'white',
    border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
  };

  const current = reports[selectedWeek];
  const isCurrentWeek = selectedWeek === 0;

  const formatWeekLabel = (report: WeekReport, index: number) => {
    if (index === 0) return 'This Week';
    if (index === 1) return 'Last Week';
    return new Date(report.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ maxWidth: 1200 }}>

      {/* Header */}
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
          Weekly Reports
        </h2>
        <p style={{ fontSize: 13, color: isDark ? '#64748b' : '#9ca3af', margin: 0 }}>
          Auto-generated progress summaries
        </p>
      </div>

      {/* Week selector */}
      <div style={{ ...card, borderRadius: 12, padding: '12px 16px', marginBottom: 16, overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {reports.slice(0, 6).map((report, i) => (
            <button key={i} onClick={() => setSelectedWeek(i)}
              style={{
                padding: '8px 14px', borderRadius: 8, border: 'none',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: selectedWeek === i ? '#6366f1' : isDark ? '#0f172a' : '#f9fafb',
                color: selectedWeek === i ? 'white' : isDark ? '#94a3b8' : '#6b7280',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}>
              {formatWeekLabel(report, i)}
            </button>
          ))}
        </div>
      </div>

      {current && (
        <>
          {/* Score card */}
          <div style={{
            ...card, borderRadius: 16,
            padding: isMobile ? '20px' : '28px',
            marginBottom: isMobile ? 16 : 24,
            display: 'flex', alignItems: 'center',
            gap: isMobile ? 16 : 24, flexWrap: 'wrap',
          }}>
            {/* Circle score */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="42"
                  fill="none" stroke={isDark ? '#334155' : '#f3f4f6'} strokeWidth="8" />
                <circle cx="50" cy="50" r="42"
                  fill="none" stroke={getScoreColor(current.score)} strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - current.score / 100)}`}
                />
              </svg>
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)', textAlign: 'center',
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827', letterSpacing: '-0.5px' }}>
                  {current.score}
                </div>
                <div style={{ fontSize: 10, color: isDark ? '#64748b' : '#9ca3af' }}>/ 100</div>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <h3 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827', margin: 0 }}>
                  {getScoreLabel(current.score)}
                </h3>
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                  background: `${getScoreColor(current.score)}20`,
                  color: getScoreColor(current.score),
                }}>
                  {isCurrentWeek ? 'In Progress' : 'Completed'}
                </span>
              </div>
              <p style={{ fontSize: 13, color: isDark ? '#64748b' : '#9ca3af', margin: '0 0 12px' }}>
                {new Date(current.weekStart + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} —{' '}
                {new Date(current.weekEnd + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { label: 'Days Logged', value: `${current.daysLogged}/7` },
                  { label: 'Hours', value: `${current.totalHours}h` },
                  { label: 'Habits', value: `${current.habitsCompleted}/${current.habitTotal}` },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827' }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: isDark ? '#64748b' : '#9ca3af' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Metrics grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? 10 : 16,
            marginBottom: isMobile ? 16 : 24,
          }}>
            {[
              {
                label: 'Habit Completion',
                value: current.habitTotal > 0 ? Math.round((current.habitsCompleted / current.habitTotal) * 100) : 0,
                unit: '%',
                color: '#10b981',
                detail: `${current.habitsCompleted} of ${current.habitTotal} habits`,
              },
              {
                label: 'Days Logged',
                value: Math.round((current.daysLogged / 7) * 100),
                unit: '%',
                color: '#6366f1',
                detail: `${current.daysLogged} of 7 days`,
              },
              {
                label: 'Study Hours',
                value: current.totalHours,
                unit: 'h',
                color: '#f59e0b',
                detail: `${Math.round(current.totalHours / 7 * 10) / 10}h avg per day`,
              },
            ].map(m => (
              <div key={m.label} style={{ ...card, borderRadius: 12, padding: isMobile ? '14px' : '20px' }}>
                <p style={{ fontSize: 12, color: isDark ? '#64748b' : '#9ca3af', margin: '0 0 8px', fontWeight: 500 }}>
                  {m.label}
                </p>
                <p style={{ fontSize: isMobile ? 22 : 26, fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
                  {m.value}{m.unit}
                </p>
                <div style={{ height: 4, borderRadius: 999, background: isDark ? '#334155' : '#f3f4f6', overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{
                    height: '100%', borderRadius: 999,
                    width: `${Math.min(m.unit === '%' ? m.value : (m.value / 40) * 100, 100)}%`,
                    background: m.color,
                  }} />
                </div>
                <p style={{ fontSize: 11, color: isDark ? '#64748b' : '#9ca3af', margin: 0 }}>{m.detail}</p>
              </div>
            ))}
          </div>

          {/* Goals & Projects summary */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 10 : 16,
          }}>
            <div style={{ ...card, borderRadius: 12, padding: isMobile ? '14px' : '20px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#f1f5f9' : '#111827', margin: '0 0 14px' }}>
                Goals Summary
              </h3>
              {current.goalTotal === 0 ? (
                <p style={{ fontSize: 13, color: isDark ? '#475569' : '#9ca3af', margin: 0 }}>No goals yet</p>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#6b7280' }}>Total Goals</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827' }}>{current.goalTotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#6b7280' }}>Completed</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>{current.goalsCompleted}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#6b7280' }}>In Progress</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#6366f1' }}>{current.goalTotal - current.goalsCompleted}</span>
                  </div>
                </>
              )}
            </div>

            <div style={{ ...card, borderRadius: 12, padding: isMobile ? '14px' : '20px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#f1f5f9' : '#111827', margin: '0 0 14px' }}>
                Projects Summary
              </h3>
              {current.projectTotal === 0 ? (
                <p style={{ fontSize: 13, color: isDark ? '#475569' : '#9ca3af', margin: 0 }}>No projects yet</p>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#6b7280' }}>Total Projects</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827' }}>{current.projectTotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#6b7280' }}>Completed</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>{current.projectsCompleted}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#6b7280' }}>In Progress</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#8b5cf6' }}>{current.projectTotal - current.projectsCompleted}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}