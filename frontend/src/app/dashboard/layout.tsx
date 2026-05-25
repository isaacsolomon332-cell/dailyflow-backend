'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context';
import { useTheme } from '@/lib/theme';
import Sidebar from '@/components/dashboard/Sidebar';
import MobileNav from '@/components/dashboard/MobileNav';
import Header from '@/components/dashboard/Header';
import PomodoroTimer from '@/components/dashboard/PomodoroTimer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { isDark } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading || !user) return null;

  const sidebarWidth = collapsed ? 60 : 240;

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: isDark ? '#0f172a' : '#f9fafb',
      transition: 'background 0.3s ease',
    }}>
      {!isMobile && <Sidebar onCollapse={setCollapsed} />}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        marginLeft: isMobile ? 0 : sidebarWidth,
        transition: 'margin-left 0.2s ease',
        paddingBottom: isMobile ? 64 : 0,
      }}>
        <Header isMobile={isMobile} />
        <main style={{
          flex: 1,
          padding: isMobile ? '16px' : '28px',
          overflowY: 'auto',
          background: isDark ? '#0f172a' : '#f9fafb',
          transition: 'background 0.3s ease',
        }}>
          {children}
        </main>
      </div>
      {isMobile && <MobileNav />}
      <PomodoroTimer />
    </div>
  );
}