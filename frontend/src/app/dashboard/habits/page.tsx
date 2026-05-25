'use client';

import { useState, useEffect } from 'react';
import { loadData, saveData } from '@/lib/store';

type Frequency = 'daily' | 'weekly' | 'monthly';
type Category = 'health' | 'learning' | 'fitness' | 'mindfulness' | 'productivity' | 'other';

interface Habit {
  id: string;
  name: string;
  description: string;
  category: Category;
  frequency: Frequency;
  reminder: string;
  streak: number;
  completedDates: string[];
  createdAt: string;
}

const categoryConfig = {
  health: { label: 'Health', color: '#10b981', bg: '#ecfdf5' },
  learning: { label: 'Learning', color: '#6366f1', bg: '#eef2ff' },
  fitness: { label: 'Fitness', color: '#f59e0b', bg: '#fffbeb' },
  mindfulness: { label: 'Mindfulness', color: '#8b5cf6', bg: '#f5f3ff' },
  productivity: { label: 'Productivity', color: '#3b82f6', bg: '#eff6ff' },
  other: { label: 'Other', color: '#6b7280', bg: '#f9fafb' },
};

const frequencyConfig = {
  daily: { label: 'Daily' },
  weekly: { label: 'Weekly' },
  monthly: { label: 'Monthly' },
};

const emptyForm = {
  name: '',
  description: '',
  category: 'health' as Category,
  frequency: 'daily' as Frequency,
  reminder: '',
};

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>(() => loadData().habits);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
  saveData({ habits });
}, [habits]);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isMobile, setIsMobile] = useState(false);
  const [filter, setFilter] = useState<'all' | Category>('all');

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const isCompletedToday = (habit: Habit) =>
    habit.completedDates.includes(today);

  const toggleToday = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const completed = h.completedDates.includes(today);
      const newDates = completed
        ? h.completedDates.filter(d => d !== today)
        : [...h.completedDates, today];

      // Calculate streak
      let streak = 0;
      const sorted = [...newDates].sort().reverse();
      const todayDate = new Date(today);
      for (let i = 0; i < sorted.length; i++) {
        const d = new Date(sorted[i]);
        const diff = Math.round((todayDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === i) streak++;
        else break;
      }

      return { ...h, completedDates: newDates, streak };
    }));
  };

  const filtered = habits.filter(h =>
    filter === 'all' || h.category === filter
  );

  const completedToday = habits.filter(h => isCompletedToday(h)).length;
  const totalActive = habits.length;
  const bestStreak = habits.length ? Math.max(...habits.map(h => h.streak)) : 0;
  const completionRate = totalActive
    ? Math.round((completedToday / totalActive) * 100) : 0;

  const openAdd = () => {
    setEditingHabit(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (h: Habit) => {
    setEditingHabit(h);
    setForm({
      name: h.name, description: h.description,
      category: h.category, frequency: h.frequency,
      reminder: h.reminder,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingHabit) {
      setHabits(prev => prev.map(h =>
        h.id === editingHabit.id ? { ...h, ...form } : h
      ));
    } else {
      setHabits(prev => [...prev, {
        id: Date.now().toString(),
        ...form,
        streak: 0,
        completedDates: [],
        createdAt: new Date().toISOString(),
      }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  // Last 7 days for mini calendar
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    borderRadius: 10, border: '1px solid #e5e7eb',
    fontSize: 14, color: '#111827', background: '#f9fafb',
    outline: 'none', boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block', fontSize: 13,
    fontWeight: 600 as const, color: '#374151', marginBottom: 6,
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
          { label: 'Total Habits', value: totalActive, color: '#6366f1' },
          { label: 'Done Today', value: `${completedToday}/${totalActive}`, color: '#10b981' },
          { label: 'Best Streak', value: `${bestStreak}d`, color: '#f59e0b' },
          { label: "Today's Rate", value: `${completionRate}%`, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'white', borderRadius: 12,
            padding: isMobile ? '14px' : '16px 20px',
            border: '1px solid #f3f4f6',
          }}>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 6px', fontWeight: 500 }}>
              {s.label}
            </p>
            <p style={{
              fontSize: isMobile ? 22 : 26, fontWeight: 700,
              color: '#111827', margin: 0, letterSpacing: '-0.5px',
            }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{
        background: 'white', borderRadius: 12,
        padding: isMobile ? '12px' : '16px 20px',
        border: '1px solid #f3f4f6', marginBottom: 16,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          {(['all', ...Object.keys(categoryConfig)] as const).map(f => (
            <button key={f} onClick={() => setFilter(f as any)}
              style={{
                padding: isMobile ? '5px 9px' : '6px 12px',
                borderRadius: 8, fontSize: isMobile ? 11 : 12,
                fontWeight: 500, cursor: 'pointer', border: 'none',
                background: filter === f ? '#6366f1' : '#f9fafb',
                color: filter === f ? 'white' : '#6b7280',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}>
              {f === 'all' ? 'All' : categoryConfig[f as Category].label}
            </button>
          ))}
        </div>
        <button onClick={openAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: isMobile ? '8px 12px' : '8px 16px',
            borderRadius: 8, background: '#6366f1',
            color: 'white', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {isMobile ? 'Add' : 'Add Habit'}
        </button>
      </div>

      {/* Habits list */}
      {filtered.length === 0 ? (
        <div style={{
          background: 'white', borderRadius: 12,
          padding: '60px 20px', border: '1px solid #f3f4f6',
          textAlign: 'center',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: '#f9fafb', border: '1px solid #f3f4f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#d1d5db" strokeWidth="2" strokeLinecap="round">
              <polyline points="9 11 12 14 22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#6b7280', margin: '0 0 4px' }}>
            No habits yet
          </p>
          <p style={{ fontSize: 13, color: '#d1d5db', margin: '0 0 20px' }}>
            Build consistency by tracking daily habits
          </p>
          <button onClick={openAdd}
            style={{
              padding: '8px 20px', borderRadius: 8,
              background: '#6366f1', color: 'white',
              border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
            }}>
            Add Your First Habit
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(habit => {
            const done = isCompletedToday(habit);
            const cat = categoryConfig[habit.category];
            return (
              <div key={habit.id} style={{
                background: 'white', borderRadius: 12, padding: '16px 20px',
                border: `1px solid ${done ? '#d1fae5' : '#f3f4f6'}`,
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 16,
              }}>
                {/* Check button */}
                <button onClick={() => toggleToday(habit.id)}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    border: `2px solid ${done ? '#10b981' : '#e5e7eb'}`,
                    background: done ? '#10b981' : 'white',
                    cursor: 'pointer', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}>
                  {done && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="white" strokeWidth="3" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: 8, marginBottom: 4, flexWrap: 'wrap',
                  }}>
                    <h3 style={{
                      fontSize: 14, fontWeight: 600,
                      color: done ? '#9ca3af' : '#111827',
                      margin: 0, letterSpacing: '-0.2px',
                      textDecoration: done ? 'line-through' : 'none',
                    }}>
                      {habit.name}
                    </h3>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '1px 7px',
                      borderRadius: 999, background: cat.bg, color: cat.color,
                    }}>
                      {cat.label}
                    </span>
                    <span style={{
                      fontSize: 11, padding: '1px 7px',
                      borderRadius: 999, background: '#f3f4f6', color: '#6b7280',
                    }}>
                      {frequencyConfig[habit.frequency].label}
                    </span>
                  </div>

                  {habit.description && !isMobile && (
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 8px' }}>
                      {habit.description}
                    </p>
                  )}

                  {/* Last 7 days */}
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {last7Days.map((date, i) => {
                      const completed = habit.completedDates.includes(date);
                      const isToday = date === today;
                      return (
                        <div key={date} style={{
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', gap: 2,
                        }}>
                          {!isMobile && (
                            <span style={{
                              fontSize: 9, color: '#d1d5db',
                              textTransform: 'uppercase',
                            }}>
                              {dayLabels[new Date(date).getDay()]}
                            </span>
                          )}
                          <div style={{
                            width: isMobile ? 20 : 22,
                            height: isMobile ? 20 : 22,
                            borderRadius: 6,
                            background: completed
                              ? '#10b981'
                              : isToday ? '#eef2ff' : '#f9fafb',
                            border: isToday
                              ? '1.5px solid #6366f1'
                              : '1px solid #f3f4f6',
                            transition: 'all 0.15s',
                          }} />
                        </div>
                      );
                    })}
                    <span style={{
                      fontSize: 11, color: '#9ca3af',
                      marginLeft: 6, whiteSpace: 'nowrap',
                    }}>
                      🔥 {habit.streak}d
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => openEdit(habit)}
                    style={{
                      width: 30, height: 30, borderRadius: 8,
                      border: '1px solid #f3f4f6', background: 'white',
                      cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: '#6b7280',
                    }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(habit.id)}
                    style={{
                      width: 30, height: 30, borderRadius: 8,
                      border: '1px solid #fecaca', background: '#fef2f2',
                      cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: '#ef4444',
                    }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{
            background: 'white', borderRadius: 16,
            padding: isMobile ? 20 : 28,
            width: '100%', maxWidth: 480,
            boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 20,
            }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>
                {editingHabit ? 'Edit Habit' : 'Add New Habit'}
              </h2>
              <button onClick={() => setShowModal(false)}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  border: '1px solid #f3f4f6', background: 'white',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#9ca3af',
                }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Name */}
              <div>
                <label style={labelStyle}>
                  Habit Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input type="text" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Morning Exercise"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <input type="text" value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Short description (optional)"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* Category & Frequency */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value as Category }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    {Object.entries(categoryConfig).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Frequency</label>
                  <select value={form.frequency}
                    onChange={e => setForm(p => ({ ...p, frequency: e.target.value as Frequency }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    {Object.entries(frequencyConfig).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reminder */}
              <div>
                <label style={labelStyle}>Reminder Time</label>
                <input type="time" value={form.reminder}
                  onChange={e => setForm(p => ({ ...p, reminder: e.target.value }))}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowModal(false)}
                  style={{
                    flex: 1, padding: '11px', borderRadius: 10,
                    border: '1px solid #e5e7eb', background: 'white',
                    color: '#374151', fontWeight: 600, fontSize: 14,
                    cursor: 'pointer',
                  }}>
                  Cancel
                </button>
                <button onClick={handleSave}
                  style={{
                    flex: 1, padding: '11px', borderRadius: 10,
                    border: 'none', background: '#6366f1',
                    color: 'white', fontWeight: 600, fontSize: 14,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                  }}>
                  {editingHabit ? 'Save Changes' : 'Add Habit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}