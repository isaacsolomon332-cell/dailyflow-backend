'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { loadData } from '@/lib/store';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  bg: string;
  category: 'habits' | 'goals' | 'projects' | 'calendar' | 'special';
  condition: (data: any) => boolean;
  progress: (data: any) => { current: number; total: number };
}

const badges: Badge[] = [
  // Habits
  {
    id: 'first_habit',
    title: 'Habit Starter',
    description: 'Create your first habit',
    icon: '🌱',
    color: '#10b981',
    bg: '#ecfdf5',
    category: 'habits',
    condition: (data) => data.habits.length >= 1,
    progress: (data) => ({ current: Math.min(data.habits.length, 1), total: 1 }),
  },
  {
    id: 'habit_collector',
    title: 'Habit Collector',
    description: 'Create 5 habits',
    icon: '🌿',
    color: '#10b981',
    bg: '#ecfdf5',
    category: 'habits',
    condition: (data) => data.habits.length >= 5,
    progress: (data) => ({ current: Math.min(data.habits.length, 5), total: 5 }),
  },
  {
    id: 'streak_3',
    title: 'On Fire',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    color: '#f59e0b',
    bg: '#fffbeb',
    category: 'habits',
    condition: (data) => data.habits.some((h: any) => h.streak >= 3),
    progress: (data) => ({
      current: Math.min(Math.max(...data.habits.map((h: any) => h.streak), 0), 3),
      total: 3,
    }),
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚡',
    color: '#f59e0b',
    bg: '#fffbeb',
    category: 'habits',
    condition: (data) => data.habits.some((h: any) => h.streak >= 7),
    progress: (data) => ({
      current: Math.min(Math.max(...data.habits.map((h: any) => h.streak), 0), 7),
      total: 7,
    }),
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    color: '#f59e0b',
    bg: '#fffbeb',
    category: 'habits',
    condition: (data) => data.habits.some((h: any) => h.streak >= 30),
    progress: (data) => ({
      current: Math.min(Math.max(...data.habits.map((h: any) => h.streak), 0), 30),
      total: 30,
    }),
  },
  // Goals
  {
    id: 'first_goal',
    title: 'Goal Setter',
    description: 'Create your first goal',
    icon: '🎯',
    color: '#6366f1',
    bg: '#eef2ff',
    category: 'goals',
    condition: (data) => data.goals.length >= 1,
    progress: (data) => ({ current: Math.min(data.goals.length, 1), total: 1 }),
  },
  {
    id: 'goal_achiever',
    title: 'Goal Achiever',
    description: 'Complete your first goal',
    icon: '🏆',
    color: '#6366f1',
    bg: '#eef2ff',
    category: 'goals',
    condition: (data) => data.goals.some((g: any) => g.status === 'completed'),
    progress: (data) => ({
      current: Math.min(data.goals.filter((g: any) => g.status === 'completed').length, 1),
      total: 1,
    }),
  },
  {
    id: 'goal_master',
    title: 'Goal Master',
    description: 'Complete 5 goals',
    icon: '🥇',
    color: '#6366f1',
    bg: '#eef2ff',
    category: 'goals',
    condition: (data) => data.goals.filter((g: any) => g.status === 'completed').length >= 5,
    progress: (data) => ({
      current: Math.min(data.goals.filter((g: any) => g.status === 'completed').length, 5),
      total: 5,
    }),
  },
  // Projects
  {
    id: 'first_project',
    title: 'Project Starter',
    description: 'Create your first project',
    icon: '🚀',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    category: 'projects',
    condition: (data) => data.projects.length >= 1,
    progress: (data) => ({ current: Math.min(data.projects.length, 1), total: 1 }),
  },
  {
    id: 'project_completer',
    title: 'Project Completer',
    description: 'Complete your first project',
    icon: '✅',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    category: 'projects',
    condition: (data) => data.projects.some((p: any) => p.status === 'completed'),
    progress: (data) => ({
      current: Math.min(data.projects.filter((p: any) => p.status === 'completed').length, 1),
      total: 1,
    }),
  },
  // Calendar
  {
    id: 'first_log',
    title: 'Day Logger',
    description: 'Log your first day',
    icon: '📅',
    color: '#3b82f6',
    bg: '#eff6ff',
    category: 'calendar',
    condition: (data) => Object.keys(data.calendar).length >= 1,
    progress: (data) => ({ current: Math.min(Object.keys(data.calendar).length, 1), total: 1 }),
  },
  {
    id: 'log_7',
    title: 'Week Tracker',
    description: 'Log 7 days',
    icon: '📆',
    color: '#3b82f6',
    bg: '#eff6ff',
    category: 'calendar',
    condition: (data) => Object.keys(data.calendar).length >= 7,
    progress: (data) => ({ current: Math.min(Object.keys(data.calendar).length, 7), total: 7 }),
  },
  {
    id: 'log_30',
    title: 'Month Logger',
    description: 'Log 30 days',
    icon: '🗓️',
    color: '#3b82f6',
    bg: '#eff6ff',
    category: 'calendar',
    condition: (data) => Object.keys(data.calendar).length >= 30,
    progress: (data) => ({ current: Math.min(Object.keys(data.calendar).length, 30), total: 30 }),
  },
  {
    id: 'perfect_day',
    title: 'Perfect Day',
    description: 'Complete all tasks in a logged day',
    icon: '⭐',
    color: '#f59e0b',
    bg: '#fffbeb',
    category: 'calendar',
    condition: (data) => Object.values(data.calendar).some((d: any) =>
      d.tasks.length > 0 && d.tasks.every((t: any) => t.completed)
    ),
    progress: (data) => ({
      current: Object.values(data.calendar).some((d: any) =>
        d.tasks.length > 0 && d.tasks.every((t: any) => t.completed)
      ) ? 1 : 0,
      total: 1,
    }),
  },
  // Special
  {
    id: 'all_rounder',
    title: 'All Rounder',
    description: 'Have at least 1 goal, project, and habit',
    icon: '🌟',
    color: '#ec4899',
    bg: '#fdf2f8',
    category: 'special',
    condition: (data) => data.goals.length >= 1 && data.projects.length >= 1 && data.habits.length >= 1,
    progress: (data) => ({
      current: (data.goals.length >= 1 ? 1 : 0) + (data.projects.length >= 1 ? 1 : 0) + (data.habits.length >= 1 ? 1 : 0),
      total: 3,
    }),
  },
  {
    id: 'overachiever',
    title: 'Overachiever',
    description: 'Complete 3 goals and 3 projects',
    icon: '💎',
    color: '#ec4899',
    bg: '#fdf2f8',
    category: 'special',
    condition: (data) =>
      data.goals.filter((g: any) => g.status === 'completed').length >= 3 &&
      data.projects.filter((p: any) => p.status === 'completed').length >= 3,
    progress: (data) => ({
      current: Math.min(data.goals.filter((g: any) => g.status === 'completed').length, 3) +
        Math.min(data.projects.filter((p: any) => p.status === 'completed').length, 3),
      total: 6,
    }),
  },
];

const categoryConfig = {
  habits: { label: 'Habits', color: '#10b981' },
  goals: { label: 'Goals', color: '#6366f1' },
  projects: { label: 'Projects', color: '#8b5cf6' },
  calendar: { label: 'Calendar', color: '#3b82f6' },
  special: { label: 'Special', color: '#ec4899' },
};

export default function BadgesPage() {
  const { isDark } = useTheme();
  const [data, setData] = useState(() => loadData());
  const [filter, setFilter] = useState<'all' | Badge['category']>('all');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const refresh = () => setData(loadData());
    window.addEventListener('dailyflow-update', refresh);
    return () => window.removeEventListener('dailyflow-update', refresh);
  }, []);

  const earned = badges.filter(b => b.condition(data));
  const total = badges.length;
  const filtered = badges.filter(b => filter === 'all' || b.category === filter);

  const card = {
    background: isDark ? '#1e293b' : 'white',
    border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
  };

  return (
    <div style={{ maxWidth: 1200 }}>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: isMobile ? 10 : 16,
        marginBottom: isMobile ? 16 : 24,
      }}>
        {[
          { label: 'Earned', value: `${earned.length}/${total}`, color: '#6366f1' },
          { label: 'Habits Badges', value: badges.filter(b => b.category === 'habits' && b.condition(data)).length, color: '#10b981' },
          { label: 'Goals Badges', value: badges.filter(b => b.category === 'goals' && b.condition(data)).length, color: '#8b5cf6' },
          { label: 'Special Badges', value: badges.filter(b => b.category === 'special' && b.condition(data)).length, color: '#ec4899' },
        ].map(s => (
          <div key={s.label} style={{ ...card, borderRadius: 12, padding: isMobile ? '14px' : '16px 20px' }}>
            <p style={{ fontSize: 12, color: isDark ? '#64748b' : '#9ca3af', margin: '0 0 6px', fontWeight: 500 }}>
              {s.label}
            </p>
            <p style={{ fontSize: isMobile ? 22 : 26, fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827', margin: 0, letterSpacing: '-0.5px' }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ ...card, borderRadius: 12, padding: isMobile ? '14px' : '20px', marginBottom: isMobile ? 16 : 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#f1f5f9' : '#111827', margin: 0 }}>
            Overall Progress
          </h3>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#6366f1' }}>
            {Math.round((earned.length / total) * 100)}%
          </span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: isDark ? '#334155' : '#f3f4f6', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 999,
            width: `${(earned.length / total) * 100}%`,
            background: 'linear-gradient(90deg, #6366f1, #a855f7)',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <p style={{ fontSize: 12, color: isDark ? '#64748b' : '#9ca3af', margin: '8px 0 0' }}>
          {earned.length} of {total} badges earned
        </p>
      </div>

      {/* Filter */}
      <div style={{ ...card, borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {(['all', ...Object.keys(categoryConfig)] as const).map(f => (
          <button key={f} onClick={() => setFilter(f as any)}
            style={{
              padding: '6px 12px', borderRadius: 8, border: 'none',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: filter === f ? '#6366f1' : isDark ? '#0f172a' : '#f9fafb',
              color: filter === f ? 'white' : isDark ? '#94a3b8' : '#6b7280',
              transition: 'all 0.15s',
            }}>
            {f === 'all' ? 'All' : categoryConfig[f as Badge['category']].label}
          </button>
        ))}
      </div>

      {/* Badges grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: isMobile ? 10 : 16,
      }}>
        {filtered.map(badge => {
          const isEarned = badge.condition(data);
          const prog = badge.progress(data);
          const pct = Math.round((prog.current / prog.total) * 100);

          return (
            <div key={badge.id} style={{
              ...card, borderRadius: 16,
              padding: isMobile ? '16px 12px' : '20px',
              textAlign: 'center',
              opacity: isEarned ? 1 : 0.6,
              transition: 'all 0.2s',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {isEarned && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#10b981',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                    stroke="white" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              )}

              <div style={{
                width: isMobile ? 48 : 56, height: isMobile ? 48 : 56,
                borderRadius: 16, margin: '0 auto 12px',
                background: isEarned ? badge.bg : isDark ? '#0f172a' : '#f9fafb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isMobile ? 22 : 26,
                filter: isEarned ? 'none' : 'grayscale(100%)',
                border: isEarned ? `2px solid ${badge.color}30` : `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
              }}>
                {badge.icon}
              </div>

              <h3 style={{
                fontSize: isMobile ? 12 : 13, fontWeight: 700,
                color: isEarned ? (isDark ? '#f1f5f9' : '#111827') : (isDark ? '#475569' : '#9ca3af'),
                margin: '0 0 4px',
              }}>
                {badge.title}
              </h3>
              <p style={{
                fontSize: 11, color: isDark ? '#64748b' : '#9ca3af',
                margin: '0 0 12px', lineHeight: 1.4,
              }}>
                {badge.description}
              </p>

              <div style={{ height: 4, borderRadius: 999, background: isDark ? '#334155' : '#f3f4f6', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 999,
                  width: `${pct}%`,
                  background: isEarned ? badge.color : isDark ? '#475569' : '#d1d5db',
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <p style={{ fontSize: 10, color: isDark ? '#475569' : '#d1d5db', margin: '4px 0 0' }}>
                {prog.current}/{prog.total}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}