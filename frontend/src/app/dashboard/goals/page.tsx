'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { loadData, saveData } from '@/lib/store';

type Priority = 'high' | 'medium' | 'low';
type Status = 'active' | 'completed' | 'paused';
type Category = 'study' | 'health' | 'career' | 'personal' | 'finance' | 'other';

interface Goal {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  category: Category;
  targetDate: string;
  progress: number;
  createdAt: string;
}

const priorityConfig = {
  high: { label: 'High', color: '#ef4444', bg: '#fef2f2' },
  medium: { label: 'Medium', color: '#f59e0b', bg: '#fffbeb' },
  low: { label: 'Low', color: '#10b981', bg: '#ecfdf5' },
};

const categoryConfig = {
  study: { label: 'Study', color: '#6366f1' },
  health: { label: 'Health', color: '#10b981' },
  career: { label: 'Career', color: '#f59e0b' },
  personal: { label: 'Personal', color: '#8b5cf6' },
  finance: { label: 'Finance', color: '#3b82f6' },
  other: { label: 'Other', color: '#6b7280' },
};

const emptyForm = {
  title: '',
  description: '',
  category: 'personal' as Category,
  priority: 'medium' as Priority,
  status: 'active' as Status,
  targetDate: '',
  progress: 0,
};

const templates = [
  { title: 'Read 12 books this year', category: 'study' as Category, priority: 'medium' as Priority, description: 'Read one book per month' },
  { title: 'Exercise 3x per week', category: 'health' as Category, priority: 'high' as Priority, description: 'Stay consistent with workouts' },
  { title: 'Save $5000', category: 'finance' as Category, priority: 'high' as Priority, description: 'Build emergency fund' },
  { title: 'Learn a new skill', category: 'career' as Category, priority: 'medium' as Priority, description: 'Take an online course' },
  { title: 'Drink 2L water daily', category: 'health' as Category, priority: 'low' as Priority, description: 'Stay hydrated every day' },
  { title: 'Meditate daily', category: 'personal' as Category, priority: 'medium' as Priority, description: '10 minutes every morning' },
  { title: 'Launch a side project', category: 'career' as Category, priority: 'high' as Priority, description: 'Build and ship something new' },
  { title: 'Run a 5K', category: 'health' as Category, priority: 'medium' as Priority, description: 'Train and complete a 5K race' },
];

export default function GoalsPage() {
  const { isDark } = useTheme();
  const [goals, setGoals] = useState<Goal[]>(() => loadData().goals);
  const [showModal, setShowModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isMobile, setIsMobile] = useState(false);
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    saveData({ goals });
  }, [goals]);

  const filtered = goals.filter(g => {
    const matchFilter = filter === 'all' || g.status === filter;
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalGoals = goals.length;
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const avgProgress = goals.length
    ? Math.round(goals.reduce((a, g) => a + g.progress, 0) / goals.length)
    : 0;

  const openAdd = () => {
    setEditingGoal(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (g: Goal) => {
    setEditingGoal(g);
    setForm({
      title: g.title, description: g.description,
      category: g.category, priority: g.priority,
      status: g.status, targetDate: g.targetDate,
      progress: g.progress,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editingGoal) {
      setGoals(prev => prev.map(g => g.id === editingGoal.id ? { ...g, ...form } : g));
    } else {
      setGoals(prev => [...prev, {
        id: Date.now().toString(), ...form,
        createdAt: new Date().toISOString(),
      }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));

  const useTemplate = (t: typeof templates[0]) => {
    setForm({ ...emptyForm, title: t.title, description: t.description, category: t.category, priority: t.priority });
    setShowTemplates(false);
    setEditingGoal(null);
    setShowModal(true);
  };

  const card = {
    background: isDark ? '#1e293b' : 'white',
    border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    borderRadius: 10, border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
    fontSize: 14, color: isDark ? '#f1f5f9' : '#111827',
    background: isDark ? '#0f172a' : '#f9fafb',
    outline: 'none', boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block', fontSize: 13,
    fontWeight: 600 as const,
    color: isDark ? '#94a3b8' : '#374151',
    marginBottom: 6,
  };

  return (
    <div style={{ maxWidth: 1200 }}>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: isMobile ? 10 : 16, marginBottom: isMobile ? 16 : 24,
      }}>
        {[
          { label: 'Total Goals', value: totalGoals },
          { label: 'Active', value: activeGoals },
          { label: 'Completed', value: completedGoals },
          { label: 'Avg Progress', value: `${avgProgress}%` },
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

      {/* Toolbar */}
      <div style={{
        ...card, borderRadius: 12,
        padding: isMobile ? '12px' : '14px 20px',
        marginBottom: 16,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: isMobile ? '100%' : 200 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={isDark ? '#475569' : '#9ca3af'} strokeWidth="2" strokeLinecap="round"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search goals..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 32 }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = isDark ? '#334155' : '#e5e7eb'}
            />
          </div>

          {/* Filters */}
          {(['all', 'active', 'completed', 'paused'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '6px 12px', borderRadius: 8, border: 'none',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: filter === f ? '#6366f1' : isDark ? '#0f172a' : '#f9fafb',
                color: filter === f ? 'white' : isDark ? '#94a3b8' : '#6b7280',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowTemplates(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: isMobile ? '8px 10px' : '8px 14px',
              borderRadius: 8,
              background: isDark ? '#0f172a' : '#f9fafb',
              color: isDark ? '#94a3b8' : '#6b7280',
              border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
              cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
            }}>
            📋 {!isMobile && 'Templates'}
          </button>
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
            {isMobile ? 'Add' : 'Add Goal'}
          </button>
        </div>
      </div>

      {/* Goals list */}
      {filtered.length === 0 ? (
        <div style={{ ...card, borderRadius: 12, padding: '60px 20px', textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: isDark ? '#0f172a' : '#f9fafb',
            border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke={isDark ? '#475569' : '#d1d5db'} strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: isDark ? '#94a3b8' : '#6b7280', margin: '0 0 4px' }}>
            No goals yet
          </p>
          <p style={{ fontSize: 13, color: isDark ? '#475569' : '#d1d5db', margin: '0 0 20px' }}>
            Add your first goal to get started
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={() => setShowTemplates(true)}
              style={{
                padding: '8px 16px', borderRadius: 8,
                border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                background: isDark ? '#0f172a' : '#f9fafb',
                color: isDark ? '#94a3b8' : '#6b7280',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
              }}>
              Use Template
            </button>
            <button onClick={openAdd}
              style={{
                padding: '8px 20px', borderRadius: 8,
                background: '#6366f1', color: 'white',
                border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              }}>
              Add Your First Goal
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(goal => {
            const pri = priorityConfig[goal.priority];
            const cat = categoryConfig[goal.category];
            return (
              <div key={goal.id} style={{
                ...card, borderRadius: 12, padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 16,
                transition: 'all 0.15s',
              }}>
                {/* Progress circle */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="24" cy="24" r="20" fill="none"
                      stroke={isDark ? '#334155' : '#f3f4f6'} strokeWidth="4" />
                    <circle cx="24" cy="24" r="20" fill="none"
                      stroke={cat.color} strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 20}`}
                      strokeDashoffset={`${2 * Math.PI * 20 * (1 - goal.progress / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: 10, fontWeight: 700,
                    color: isDark ? '#f1f5f9' : '#111827',
                  }}>
                    {goal.progress}%
                  </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <h3 style={{
                      fontSize: 14, fontWeight: 600,
                      color: goal.status === 'completed' ? (isDark ? '#475569' : '#9ca3af') : (isDark ? '#f1f5f9' : '#111827'),
                      margin: 0, letterSpacing: '-0.2px',
                      textDecoration: goal.status === 'completed' ? 'line-through' : 'none',
                    }}>
                      {goal.title}
                    </h3>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 999, background: pri.bg, color: pri.color }}>
                      {pri.label}
                    </span>
                    <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 999, background: `${cat.color}15`, color: cat.color }}>
                      {cat.label}
                    </span>
                  </div>

                  {goal.description && !isMobile && (
                    <p style={{ fontSize: 12, color: isDark ? '#64748b' : '#9ca3af', margin: '0 0 8px' }}>
                      {goal.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    {goal.targetDate && (
                      <span style={{ fontSize: 11, color: isDark ? '#64748b' : '#9ca3af' }}>
                        📅 {new Date(goal.targetDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 999,
                      background: goal.status === 'completed' ? '#ecfdf5' : goal.status === 'paused' ? '#f9fafb' : '#eef2ff',
                      color: goal.status === 'completed' ? '#10b981' : goal.status === 'paused' ? '#6b7280' : '#6366f1',
                    }}>
                      {goal.status}
                    </span>
                  </div>
                </div>

                {/* Progress slider + actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
                  {!isMobile && (
                    <input type="range" min={0} max={100} value={goal.progress}
                      onChange={e => setGoals(prev => prev.map(g =>
                        g.id === goal.id ? { ...g, progress: Number(e.target.value), status: Number(e.target.value) === 100 ? 'completed' : g.status } : g
                      ))}
                      style={{ width: 80, accentColor: cat.color, cursor: 'pointer' }}
                    />
                  )}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(goal)}
                      style={{
                        width: 30, height: 30, borderRadius: 8,
                        border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
                        background: isDark ? '#0f172a' : 'white',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isDark ? '#94a3b8' : '#6b7280',
                      }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(goal.id)}
                      style={{
                        width: 30, height: 30, borderRadius: 8,
                        border: '1px solid #fecaca', background: '#fef2f2',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
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
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{
            background: isDark ? '#1e293b' : 'white',
            borderRadius: 16, padding: isMobile ? 20 : 28,
            width: '100%', maxWidth: 480,
            boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
            maxHeight: '90vh', overflowY: 'auto',
            border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827', margin: 0 }}>
                {editingGoal ? 'Edit Goal' : 'Add New Goal'}
              </h2>
              <button onClick={() => setShowModal(false)}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
                  background: isDark ? '#0f172a' : 'white',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isDark ? '#94a3b8' : '#9ca3af',
                }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Title <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Read 12 books this year"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = isDark ? '#334155' : '#e5e7eb'}
                />
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <input type="text" value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Short description (optional)"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = isDark ? '#334155' : '#e5e7eb'}
                />
              </div>

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
                  <label style={labelStyle}>Priority</label>
                  <select value={form.priority}
                    onChange={e => setForm(p => ({ ...p, priority: e.target.value as Priority }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    {Object.entries(priorityConfig).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value as Status }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Target Date</label>
                  <input type="date" value={form.targetDate}
                    onChange={e => setForm(p => ({ ...p, targetDate: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = isDark ? '#334155' : '#e5e7eb'}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Progress: {form.progress}%</label>
                <input type="range" min={0} max={100} value={form.progress}
                  onChange={e => setForm(p => ({ ...p, progress: Number(e.target.value) }))}
                  style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowModal(false)}
                  style={{
                    flex: 1, padding: '11px', borderRadius: 10,
                    border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                    background: isDark ? '#0f172a' : 'white',
                    color: isDark ? '#94a3b8' : '#374151',
                    fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  }}>
                  Cancel
                </button>
                <button onClick={handleSave}
                  style={{
                    flex: 1, padding: '11px', borderRadius: 10,
                    border: 'none', background: '#6366f1',
                    color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                  }}>
                  {editingGoal ? 'Save Changes' : 'Add Goal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}
          onClick={e => { if (e.target === e.currentTarget) setShowTemplates(false); }}
        >
          <div style={{
            background: isDark ? '#1e293b' : 'white',
            borderRadius: 16, padding: isMobile ? 20 : 28,
            width: '100%', maxWidth: 480,
            boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
            maxHeight: '90vh', overflowY: 'auto',
            border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827', margin: 0 }}>
                  Goal Templates
                </h2>
                <p style={{ fontSize: 12, color: isDark ? '#64748b' : '#9ca3af', margin: '2px 0 0' }}>
                  Pick a template to get started quickly
                </p>
              </div>
              <button onClick={() => setShowTemplates(false)}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
                  background: isDark ? '#0f172a' : 'white',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isDark ? '#94a3b8' : '#9ca3af',
                }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {templates.map((t, i) => (
                <button key={i} onClick={() => useTemplate(t)}
                  style={{
                    padding: '14px 16px', borderRadius: 12,
                    border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
                    background: isDark ? '#0f172a' : '#f9fafb',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#6366f1';
                    (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#1e293b' : 'white';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = isDark ? '#334155' : '#f3f4f6';
                    (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#0f172a' : '#f9fafb';
                  }}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#f1f5f9' : '#111827', margin: '0 0 2px' }}>
                      {t.title}
                    </p>
                    <p style={{ fontSize: 12, color: isDark ? '#64748b' : '#9ca3af', margin: 0 }}>
                      {t.description}
                    </p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={isDark ? '#475569' : '#d1d5db'} strokeWidth="2" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}