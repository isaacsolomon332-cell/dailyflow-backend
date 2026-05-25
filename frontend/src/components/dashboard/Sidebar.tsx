'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context';

const navItems = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#6366f1' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/calendar',
    label: 'Calendar',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#6366f1' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/goals',
    label: 'Goals',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#6366f1' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/projects',
    label: 'Projects',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#6366f1' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/habits',
    label: 'Habits',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#6366f1' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/stats',
    label: 'Statistics',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#6366f1' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },

  {
    href: '/dashboard/reports',
    label: 'Reports',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#6366f1' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },

{
    href: '/dashboard/badges',
    label: 'Badges',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#6366f1' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6"/>
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    ),
  },

  {
    href: '/dashboard/profile',
    label: 'Profile',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#6366f1' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function Sidebar({ onCollapse }: { onCollapse?: (collapsed: boolean) => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    onCollapse?.(next);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    window.location.href = '/login';
  };

  const initials = user?.fullName
    ?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const W = collapsed ? 60 : 240;

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0,
      width: W, height: '100vh',
      background: '#0f0f1a',
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
      borderRight: '1px solid rgba(255,255,255,0.06)',
      transition: 'width 0.2s ease',
      overflow: 'hidden',
    }}>

      {/* Logo + Toggle */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        minHeight: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          {!collapsed && (
            <span style={{
              color: 'white', fontWeight: 700, fontSize: 15,
              letterSpacing: '-0.3px', whiteSpace: 'nowrap',
            }}>
              DailyFlow
            </span>
          )}
        </div>

        {!collapsed && (
          <button onClick={toggleCollapse} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.3)', padding: 4, borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* User avatar */}
      {!collapsed ? (
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 12,
            }}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                color: 'white', fontWeight: 600, fontSize: 13,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user?.fullName || 'User'}
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.3)', fontSize: 11,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                @{user?.username || ''}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '12px 0',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'center',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 12,
          }}>
            {initials}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{
        flex: 1, padding: '10px 8px',
        overflowY: 'auto', overflowX: 'hidden',
      }}>
        {!collapsed && (
          <div style={{
            color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700,
            letterSpacing: '1.5px', textTransform: 'uppercase',
            padding: '0 8px', marginBottom: 6, marginTop: 2,
          }}>
            Menu
          </div>
        )}

        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              style={{ textDecoration: 'none' }}
              title={collapsed ? item.label : ''}>
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: collapsed ? 0 : 10,
                padding: collapsed ? '10px 0' : '9px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 8, marginBottom: 1,
                background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                transition: 'all 0.15s', cursor: 'pointer',
              }}>
                {item.icon(isActive)}
                {!collapsed && (
                  <span style={{
                    color: isActive ? '#818cf8' : 'rgba(255,255,255,0.45)',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 14, whiteSpace: 'nowrap',
                  }}>
                    {item.label}
                  </span>
                )}
                {!collapsed && isActive && (
                  <div style={{
                    marginLeft: 'auto', width: 5, height: 5,
                    borderRadius: '50%', background: '#6366f1',
                  }} />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '10px 8px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        {!collapsed && (
          <div style={{
            padding: '4px 10px', marginBottom: 6,
            color: 'rgba(255,255,255,0.2)', fontSize: 11,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric',
            })}
          </div>
        )}

        {collapsed && (
          <button onClick={toggleCollapse}
            title="Expand sidebar"
            style={{
              width: '100%', padding: '10px 0', marginBottom: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.3)', borderRadius: 8,
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        )}

        <button onClick={handleLogout} disabled={isLoggingOut}
          title={collapsed ? 'Log out' : ''}
          style={{
            width: '100%',
            padding: collapsed ? '10px 0' : '9px 10px',
            borderRadius: 8,
            border: '1px solid rgba(239,68,68,0.15)',
            background: 'rgba(239,68,68,0.06)',
            color: 'rgba(239,68,68,0.7)', fontWeight: 500, fontSize: 13,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: collapsed ? 0 : 8, transition: 'all 0.15s',
          }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {!collapsed && (isLoggingOut ? 'Logging out...' : 'Log out')}
        </button>
      </div>
    </aside>
  );
}