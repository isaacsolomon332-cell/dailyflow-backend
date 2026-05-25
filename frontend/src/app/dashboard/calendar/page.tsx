'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { loadData, saveData } from '@/lib/store';

interface DayData {
  plannedHours: number;
  actualHours: number;
  tasks: { text: string; completed: boolean }[];
  notes: string;
  status: 'planned' | 'completed' | 'missed' | 'inprogress';
}

interface CalendarData {
  [date: string]: DayData;
}

const statusConfig = {
  planned: { color: '#6366f1', bg: '#eef2ff', label: 'Planned' },
  completed: { color: '#10b981', bg: '#ecfdf5', label: 'Completed' },
  missed: { color: '#ef4444', bg: '#fef2f2', label: 'Missed' },
  inprogress: { color: '#f59e0b', bg: '#fffbeb', label: 'In Progress' },
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function CalendarPage() {
  const { isDark } = useTheme();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [calendarData, setCalendarData] = useState<CalendarData>(() => loadData().calendar);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [form, setForm] = useState({
    plannedHours: 8, actualHours: 0, notes: '',
    status: 'planned' as DayData['status'],
    tasks: [] as { text: string; completed: boolean }[],
    newTask: '',
  });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    saveData({ calendar: calendarData });
  }, [calendarData]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));

  const formatDate = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const openDay = (dateStr: string) => {
    setSelectedDate(dateStr);
    const existing = calendarData[dateStr];
    if (existing) {
      setForm({ plannedHours: existing.plannedHours, actualHours: existing.actualHours, notes: existing.notes, status: existing.status, tasks: existing.tasks, newTask: '' });
    } else {
      setForm({ plannedHours: 8, actualHours: 0, notes: '', status: 'planned', tasks: [], newTask: '' });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!selectedDate) return;
    setCalendarData(prev => ({
      ...prev,
      [selectedDate]: { plannedHours: form.plannedHours, actualHours: form.actualHours, notes: form.notes, status: form.status, tasks: form.tasks },
    }));
    setShowModal(false);
  };

  const addTask = () => {
    if (!form.newTask.trim()) return;
    setForm(prev => ({ ...prev, tasks: [...prev.tasks, { text: prev.newTask.trim(), completed: false }], newTask: '' }));
  };

  const toggleTask = (index: number) => {
    setForm(prev => ({ ...prev, tasks: prev.tasks.map((t, i) => i === index ? { ...t, completed: !t.completed } : t) }));
  };

  const removeTask = (index: number) => {
    setForm(prev => ({ ...prev, tasks: prev.tasks.filter((_, i) => i !== index) }));
  };

  const totalDays = Object.keys(calendarData).length;
  const completedDays = Object.values(calendarData).filter(d => d.status === 'completed').length;
  const totalHours = Object.values(calendarData).reduce((a, d) => a + d.actualHours, 0);
  const monthDays = Object.keys(calendarData).filter(d => {
    const [y, m] = d.split('-').map(Number);
    return y === year && m - 1 === month;
  });

  const calendarCells: { day: number; currentMonth: boolean; dateStr: string }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarCells.push({ day: daysInPrevMonth - i, currentMonth: false, dateStr: formatDate(year, month - 1, daysInPrevMonth - i) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({ day: d, currentMonth: true, dateStr: formatDate(year, month, d) });
  }
  const remaining = 42 - calendarCells.length;
  for (let d = 1; d <= remaining; d++) {
    calendarCells.push({ day: d, currentMonth: false, dateStr: formatDate(year, month + 1, d) });
  }

  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

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
          { label: 'Days Logged', value: totalDays },
          { label: 'Days Completed', value: completedDays },
          { label: 'Total Hours', value: `${totalHours}h` },
          { label: 'This Month', value: monthDays.length },
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

      {/* Calendar */}
      <div style={{ ...card, borderRadius: 12, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          padding: isMobile ? '14px 16px' : '16px 24px',
          borderBottom: `1px solid ${isDark ? '#334155' : '#f9fafb'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827', margin: 0 }}>
              {MONTHS[month]} {year}
            </h2>
            <button onClick={goToToday}
              style={{
                padding: '4px 10px', borderRadius: 6,
                border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                background: isDark ? '#0f172a' : 'white',
                color: '#6366f1', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>
              Today
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[prevMonth, nextMonth].map((fn, i) => (
              <button key={i} onClick={fn}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
                  background: isDark ? '#0f172a' : 'white',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isDark ? '#94a3b8' : '#6b7280',
                }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {i === 0 ? <polyline points="15 18 9 12 15 6"/> : <polyline points="9 18 15 12 9 6"/>}
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Day labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${isDark ? '#334155' : '#f9fafb'}` }}>
          {DAYS.map(d => (
            <div key={d} style={{
              padding: isMobile ? '8px 4px' : '10px',
              textAlign: 'center', fontSize: isMobile ? 11 : 12,
              fontWeight: 600, color: isDark ? '#475569' : '#9ca3af',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              {isMobile ? d[0] : d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {calendarCells.map((cell, index) => {
            const data = calendarData[cell.dateStr];
            const isToday = cell.dateStr === todayStr;
            const isCurrentMonth = cell.currentMonth;
            const status = data?.status;

            return (
              <div key={index}
                onClick={() => isCurrentMonth && openDay(cell.dateStr)}
                style={{
                  minHeight: isMobile ? 44 : 80,
                  padding: isMobile ? '6px 4px' : '8px',
                  borderRight: (index + 1) % 7 === 0 ? 'none' : `1px solid ${isDark ? '#334155' : '#f9fafb'}`,
                  borderBottom: index < 35 ? `1px solid ${isDark ? '#334155' : '#f9fafb'}` : 'none',
                  cursor: isCurrentMonth ? 'pointer' : 'default',
                  background: isToday ? (isDark ? '#1e3a5f' : '#eef2ff') : 'transparent',
                  transition: 'background 0.15s',
                  opacity: isCurrentMonth ? 1 : 0.3,
                }}
                onMouseEnter={e => {
                  if (isCurrentMonth && !isToday) {
                    (e.currentTarget as HTMLDivElement).style.background = isDark ? '#0f172a' : '#f9fafb';
                  }
                }}
                onMouseLeave={e => {
                  if (isCurrentMonth && !isToday) {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }
                }}
              >
                <div style={{
                  width: isMobile ? 24 : 28, height: isMobile ? 24 : 28,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: isToday ? 700 : 400,
                  background: isToday ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'transparent',
                  color: isToday ? 'white' : isCurrentMonth ? (isDark ? '#94a3b8' : '#111827') : (isDark ? '#475569' : '#9ca3af'),
                  marginBottom: 4,
                }}>
                  {cell.day}
                </div>

                {data && isCurrentMonth && (
                  <div>
                    {!isMobile && (
                      <div style={{
                        fontSize: 10, fontWeight: 600,
                        padding: '1px 5px', borderRadius: 4,
                        background: statusConfig[status!].bg,
                        color: statusConfig[status!].color,
                        display: 'inline-block', marginBottom: 2,
                      }}>
                        {statusConfig[status!].label}
                      </div>
                    )}
                    {isMobile && (
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: statusConfig[status!].color,
                        margin: '0 auto',
                      }} />
                    )}
                    {!isMobile && data.actualHours > 0 && (
                      <div style={{ fontSize: 11, color: isDark ? '#64748b' : '#9ca3af' }}>
                        {data.actualHours}h logged
                      </div>
                    )}
                    {!isMobile && data.tasks.length > 0 && (
                      <div style={{ fontSize: 11, color: isDark ? '#64748b' : '#9ca3af' }}>
                        {data.tasks.filter(t => t.completed).length}/{data.tasks.length} tasks
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
        {Object.entries(statusConfig).map(([key, val]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: val.color }} />
            <span style={{ fontSize: 12, color: isDark ? '#64748b' : '#9ca3af' }}>{val.label}</span>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && selectedDate && (
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
            width: '100%', maxWidth: 500,
            boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
            maxHeight: '90vh', overflowY: 'auto',
            border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827', margin: 0 }}>
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                <p style={{ fontSize: 12, color: isDark ? '#64748b' : '#9ca3af', margin: '2px 0 0' }}>Log your day</p>
              </div>
              <button onClick={() => setShowModal(false)}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
                  background: isDark ? '#0f172a' : 'white',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isDark ? '#94a3b8' : '#9ca3af',
                }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Status */}
              <div>
                <label style={labelStyle}>Status</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {Object.entries(statusConfig).map(([key, val]) => (
                    <button key={key}
                      onClick={() => setForm(p => ({ ...p, status: key as DayData['status'] }))}
                      style={{
                        padding: '6px 12px', borderRadius: 8,
                        border: `1px solid ${form.status === key ? val.color : (isDark ? '#334155' : '#e5e7eb')}`,
                        background: form.status === key ? val.bg : 'transparent',
                        color: form.status === key ? val.color : (isDark ? '#94a3b8' : '#6b7280'),
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}>
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hours */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Planned Hours</label>
                  <input type="number" min={0} max={24} value={form.plannedHours}
                    onChange={e => setForm(p => ({ ...p, plannedHours: Number(e.target.value) }))}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = isDark ? '#334155' : '#e5e7eb'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Actual Hours</label>
                  <input type="number" min={0} max={24} value={form.actualHours}
                    onChange={e => setForm(p => ({ ...p, actualHours: Number(e.target.value) }))}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = isDark ? '#334155' : '#e5e7eb'}
                  />
                </div>
              </div>

              {/* Tasks */}
              <div>
                <label style={labelStyle}>Tasks</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input type="text" value={form.newTask}
                    onChange={e => setForm(p => ({ ...p, newTask: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addTask()}
                    placeholder="Add a task..."
                    style={{ ...inputStyle, flex: 1 }}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = isDark ? '#334155' : '#e5e7eb'}
                  />
                  <button onClick={addTask}
                    style={{
                      width: 40, height: 40, borderRadius: 10, border: 'none',
                      background: '#6366f1', color: 'white', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                </div>
                {form.tasks.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {form.tasks.map((task, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px', borderRadius: 8,
                        background: isDark ? '#0f172a' : '#f9fafb',
                        border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
                      }}>
                        <button onClick={() => toggleTask(i)}
                          style={{
                            width: 18, height: 18, borderRadius: 4,
                            border: `2px solid ${task.completed ? '#10b981' : (isDark ? '#334155' : '#e5e7eb')}`,
                            background: task.completed ? '#10b981' : 'transparent',
                            cursor: 'pointer', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                          {task.completed && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </button>
                        <span style={{
                          flex: 1, fontSize: 13,
                          textDecoration: task.completed ? 'line-through' : 'none',
                          color: task.completed ? (isDark ? '#475569' : '#9ca3af') : (isDark ? '#f1f5f9' : '#374151'),
                        }}>
                          {task.text}
                        </span>
                        <button onClick={() => removeTask(i)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#475569' : '#d1d5db', padding: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label style={labelStyle}>Notes</label>
                <textarea value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="How did your day go?"
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = isDark ? '#334155' : '#e5e7eb'}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
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
                  Save Day
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}