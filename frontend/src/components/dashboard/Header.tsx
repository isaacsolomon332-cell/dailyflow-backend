'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context';
import { useTheme } from '@/lib/theme';
import { loadData } from '@/lib/store';

const pageMeta: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/calendar': 'Calendar',
  '/dashboard/goals': 'Goals',
  '/dashboard/projects': 'Projects',
  '/dashboard/habits': 'Habits',
  '/dashboard/stats': 'Statistics',
  '/dashboard/profile': 'Profile',
};

interface SearchResult {
  type: 'goal' | 'project' | 'habit';
  title: string;
  subtitle: string;
  href: string;
}

export default function Header({ isMobile }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const title = pageMeta[pathname] || 'Dashboard';

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const initials = user?.fullName
    ?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  // Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const data = loadData();
    const results: SearchResult[] = [];

    data.goals.forEach(g => {
      if (g.title.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q)) {
        results.push({
          type: 'goal',
          title: g.title,
          subtitle: `Goal · ${g.status} · ${g.progress}% complete`,
          href: '/dashboard/goals',
        });
      }
    });

    data.projects.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) {
        results.push({
          type: 'project',
          title: p.name,
          subtitle: `Project · ${p.status}`,
          href: '/dashboard/projects',
        });
      }
    });

    data.habits.forEach(h => {
      if (h.name.toLowerCase().includes(q) || h.description?.toLowerCase().includes(q)) {
        results.push({
          type: 'habit',
          title: h.name,
          subtitle: `Habit · ${h.category} · ${h.streak}d streak`,
          href: '/dashboard/habits',
        });
      }
    });

    setSearchResults(results.slice(0, 6));
  }, [searchQuery]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Open search with Cmd+K
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const typeColors: Record<string, string> = {
    goal: '#10b981',
    project: '#8b5cf6',
    habit: '#f59e0b',
  };

  const typeIcons: Record<string, React.ReactElement> = {
    goal: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    project: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
    habit: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  };

  if (isMobile) {
    return (
      <header style={{
        height: 56, background: 'white',
        borderBottom: '1px solid #f3f4f6',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px', position: 'sticky',
        top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>
            DailyFlow
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Mobile search */}
          <button
            onClick={() => {
              setShowSearch(true);
              setTimeout(() => searchInputRef.current?.focus(), 50);
            }}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#f9fafb', border: '1px solid #f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#f9fafb', border: '1px solid #f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative',
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span style={{
              position: 'absolute', top: 7, right: 7,
              width: 6, height: 6, borderRadius: '50%',
              background: '#ef4444', border: '1.5px solid white',
            }} />
          </button>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 12,
            cursor: 'pointer',
          }}
            onClick={() => router.push('/dashboard/profile')}
          >
            {initials}
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header style={{
        height: 60, background: 'white',
        borderBottom: '1px solid #f3f4f6',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px', position: 'sticky',
        top: 0, zIndex: 50,
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1 style={{
            fontSize: 16, fontWeight: 600,
            color: '#111827', margin: 0, letterSpacing: '-0.2px',
          }}>
            {title}
          </h1>
          {pathname === '/dashboard' && (
            <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 400 }}>
              — {greeting()}, {user?.fullName?.split(' ')[0] || 'there'}
            </span>
          )}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

          {/* Search */}
          <div ref={searchRef} style={{ position: 'relative' }}>
            <div
              onClick={() => {
                setShowSearch(true);
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 14px', borderRadius: 8,
                background: '#f9fafb', border: '1px solid #f3f4f6',
                cursor: 'pointer', minWidth: 200,
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span style={{ color: '#9ca3af', fontSize: 13, flex: 1 }}>
                Search...
              </span>
              <span style={{
                background: '#e5e7eb', color: '#6b7280', fontSize: 11,
                fontWeight: 600, padding: '1px 5px', borderRadius: 4,
              }}>⌘K</span>
            </div>

            {/* Search dropdown */}
            {showSearch && (
              <div style={{
                position: 'absolute', top: 44, left: 0,
                width: 360, background: 'white',
                borderRadius: 12, boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
                border: '1px solid #f3f4f6', zIndex: 200,
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid #f9fafb',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search goals, projects, habits..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      flex: 1, border: 'none', outline: 'none',
                      fontSize: 14, color: '#111827', background: 'transparent',
                    }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')}
                      style={{
                        background: 'none', border: 'none',
                        cursor: 'pointer', color: '#9ca3af', padding: 0,
                      }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>

                {searchQuery && searchResults.length === 0 && (
                  <div style={{
                    padding: '24px 16px', textAlign: 'center',
                  }}>
                    <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
                      No results for "{searchQuery}"
                    </p>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div style={{ padding: '6px 0' }}>
                    {searchResults.map((result, i) => (
                      <div key={i}
                        onClick={() => {
                          router.push(result.href);
                          setShowSearch(false);
                          setSearchQuery('');
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 14px', cursor: 'pointer',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#f9fafb'}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                      >
                        <div style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: `${typeColors[result.type]}15`,
                          color: typeColors[result.type],
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', flexShrink: 0,
                        }}>
                          {typeIcons[result.type]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: 13, fontWeight: 600,
                            color: '#111827', margin: 0,
                            overflow: 'hidden', textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {result.title}
                          </p>
                          <p style={{
                            fontSize: 11, color: '#9ca3af',
                            margin: '1px 0 0',
                          }}>
                            {result.subtitle}
                          </p>
                        </div>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="#d1d5db" strokeWidth="2" strokeLinecap="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>
                    ))}
                  </div>
                )}

                {!searchQuery && (
                  <div style={{ padding: '16px 14px' }}>
                    <p style={{
                      fontSize: 11, color: '#9ca3af', fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                      margin: '0 0 10px',
                    }}>
                      Quick Links
                    </p>
                    {[
                      { label: 'Goals', href: '/dashboard/goals' },
                      { label: 'Projects', href: '/dashboard/projects' },
                      { label: 'Habits', href: '/dashboard/habits' },
                      { label: 'Calendar', href: '/dashboard/calendar' },
                    ].map(link => (
                      <div key={link.label}
                        onClick={() => {
                          router.push(link.href);
                          setShowSearch(false);
                        }}
                        style={{
                          padding: '8px 10px', borderRadius: 8,
                          cursor: 'pointer', fontSize: 13,
                          color: '#374151', fontWeight: 500,
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#f9fafb'}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                      >
                        {link.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowNotifications(!showNotifications)}
              style={{
                width: 36, height: 36, borderRadius: 8,
                background: '#f9fafb', border: '1px solid #f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative',
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span style={{
                position: 'absolute', top: 7, right: 7,
                width: 6, height: 6, borderRadius: '50%',
                background: '#ef4444', border: '1.5px solid white',
              }} />
            </button>

            {showNotifications && (
              <div style={{
                position: 'absolute', top: 44, right: 0,
                width: 300, background: 'white',
                borderRadius: 12, boxShadow: '0 16px 48px rgba(0,0,0,0.1)',
                border: '1px solid #f3f4f6', zIndex: 100,
              }}>
                <div style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #f9fafb',
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
                    Notifications
                  </span>
                  <button style={{
                    background: 'none', border: 'none',
                    color: '#6366f1', fontSize: 12,
                    fontWeight: 600, cursor: 'pointer',
                  }}>
                    Mark all read
                  </button>
                </div>
                {[
                  { text: '2 goals are due this week', time: '2h ago', unread: true },
                  { text: 'Keep your habit streak going', time: '5h ago', unread: true },
                  { text: "Don't forget to log today", time: '8h ago', unread: false },
                ].map((n, i) => (
                  <div key={i} style={{
                    padding: '12px 16px',
                    borderBottom: i < 2 ? '1px solid #f9fafb' : 'none',
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                    background: n.unread ? '#fafafa' : 'white',
                  }}>
                    {n.unread && (
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: '#6366f1', flexShrink: 0, marginTop: 5,
                      }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>
                        {n.text}
                      </p>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>
                        {n.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button onClick={toggleTheme}
            style={{
              width: 36, height: 36, borderRadius: 8,
              background: isDark ? '#1e293b' : '#f9fafb',
              border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 16,
            }}>
            {isDark ? '☀️' : '🌙'}
          </button>

          <div style={{
            width: 1, height: 20, background: '#f3f4f6', margin: '0 2px',
          }} />

          {/* User */}
          <div
            onClick={() => router.push('/dashboard/profile')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 10px 5px 5px',
              borderRadius: 8, cursor: 'pointer',
              border: '1px solid #f3f4f6', background: '#f9fafb',
              transition: 'all 0.15s',
            }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 11,
            }}>
              {initials}
            </div>
            <div>
              <div style={{
                fontSize: 12, fontWeight: 600,
                color: '#111827', lineHeight: 1.2,
              }}>
                {user?.fullName?.split(' ')[0] || 'User'}
              </div>
              <div style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.2 }}>
                @{user?.username || ''}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile search overlay */}
      {isMobile && showSearch && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'center', padding: '80px 16px 0',
        }}
          onClick={e => {
            if (e.target === e.currentTarget) {
              setShowSearch(false);
              setSearchQuery('');
            }
          }}
        >
          <div style={{
            width: '100%', background: 'white',
            borderRadius: 16, overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
          }}>
            <div style={{
              padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 8,
              borderBottom: '1px solid #f9fafb',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search goals, projects, habits..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  fontSize: 15, color: '#111827', background: 'transparent',
                }}
              />
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                style={{
                  background: 'none', border: 'none',
                  cursor: 'pointer', color: '#9ca3af',
                  fontSize: 13, fontWeight: 600,
                }}>
                Cancel
              </button>
            </div>
            {searchResults.length > 0 && (
              <div>
                {searchResults.map((result, i) => (
                  <div key={i}
                    onClick={() => {
                      router.push(result.href);
                      setShowSearch(false);
                      setSearchQuery('');
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px',
                      borderBottom: i < searchResults.length - 1 ? '1px solid #f9fafb' : 'none',
                      cursor: 'pointer',
                    }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: `${typeColors[result.type]}15`,
                      color: typeColors[result.type],
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0,
                    }}>
                      {typeIcons[result.type]}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>
                        {result.title}
                      </p>
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: '1px 0 0' }}>
                        {result.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {searchQuery && searchResults.length === 0 && (
              <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>
                  No results for "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}