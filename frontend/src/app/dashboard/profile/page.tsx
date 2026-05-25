'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context';
import { useTheme } from '@/lib/theme';

export default function ProfilePage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    username: '',
    phoneNumber: '',
    bio: '',
    dailyReminderTime: '09:00',
  });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        email: user.email || '',
        username: user.username || '',
        phoneNumber: user.phoneNumber || '',
        bio: user.bio || '',
        dailyReminderTime: user.dailyReminderTime || '09:00',
      });
    }
  }, [user]);

  const initials = user?.fullName
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const handleSave = async () => {
    setIsSaving(true);
    // Will connect to backend later
    await new Promise(r => setTimeout(r, 800));
    setIsSaving(false);
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    borderRadius: 10, border: '1px solid #e5e7eb',
    fontSize: 14, color: isDark ? '#f1f5f9' : '#111827', background: '#f9fafb',
    outline: 'none', boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  };

  const disabledInputStyle = {
    ...inputStyle,
    background: '#f9fafb',
    color: '#9ca3af',
    cursor: 'not-allowed',
  };

  const labelStyle = {
    display: 'block', fontSize: 13,
    fontWeight: 600 as const, color: '#374151', marginBottom: 6,
  };

  const stats = [
    { label: 'Goals Created', value: '0' },
    { label: 'Habits Tracked', value: '0' },
    { label: 'Projects Active', value: '0' },
    { label: 'Days Logged', value: '0' },
  ];

  return (
    <div style={{ maxWidth: 800 }}>

      {/* Success toast */}
      {saved && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 300,
          background: '#ecfdf5', border: '1px solid #d1fae5',
          borderRadius: 10, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#10b981" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#10b981' }}>
            Profile updated successfully!
          </span>
        </div>
      )}

      {/* Profile header card */}
      <div style={{
        background: isDark ? '#1e293b' : 'white', borderRadius: 16,
        border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
        marginBottom: 16, overflow: 'hidden',
      }}>
        {/* Banner */}
        <div style={{
          height: 100,
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          position: 'relative',
        }} />

        {/* Avatar + info */}
        <div style={{
          padding: isMobile ? '0 16px 20px' : '0 28px 24px',
          position: 'relative',
        }}>
          {/* Avatar */}
          <div style={{
            width: isMobile ? 72 : 88,
            height: isMobile ? 72 : 88,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700,
            fontSize: isMobile ? 24 : 30,
            border: '4px solid white',
            marginTop: isMobile ? -36 : -44,
            position: 'relative', zIndex: 1,
            boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
          }}>
            {initials}
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', marginTop: 12,
            flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <h2 style={{
                fontSize: isMobile ? 18 : 22, fontWeight: 700,
                color: isDark ? '#f1f5f9' : '#111827', margin: '0 0 4px',
                letterSpacing: '-0.3px',
              }}>
                {user?.fullName || 'User'}
              </h2>
              <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
                @{user?.username} · {user?.email}
              </p>
              {user?.bio && (
                <p style={{
                  fontSize: 13, color: '#6b7280',
                  margin: '8px 0 0', lineHeight: 1.5,
                  maxWidth: 400,
                }}>
                  {user.bio}
                </p>
              )}
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{
                padding: '8px 16px', borderRadius: 8,
                border: isEditing ? '1px solid #e5e7eb' : '1px solid #6366f1',
                background: isEditing ? 'white' : '#6366f1',
                color: isEditing ? '#374151' : 'white',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: isMobile ? 10 : 16,
        marginBottom: 16,
      }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: isDark ? '#1e293b' : 'white', borderRadius: 12,
            padding: isMobile ? '14px' : '16px 20px',
            border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`, textAlign: 'center',
          }}>
            <p style={{
              fontSize: isMobile ? 22 : 26, fontWeight: 700,
              color: isDark ? '#f1f5f9' : '#111827', margin: '0 0 4px',
              letterSpacing: '-0.5px',
            }}>
              {s.value}
            </p>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, fontWeight: 500 }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Profile form */}
      <div style={{
        background: isDark ? '#1e293b' : 'white', borderRadius: 16,
        border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`, padding: isMobile ? 16 : 28,
        marginBottom: 16,
      }}>
        <h3 style={{
          fontSize: 15, fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827',
          margin: '0 0 20px',
        }}>
          Personal Information
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Full name & username */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 12,
          }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input type="text" value={form.fullName}
                onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                disabled={!isEditing}
                style={isEditing ? inputStyle : disabledInputStyle}
                onFocus={e => isEditing && (e.target.style.borderColor = '#6366f1')}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={labelStyle}>Username</label>
              <input type="text" value={form.username}
                disabled
                style={disabledInputStyle}
              />
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>
                Username cannot be changed
              </p>
            </div>
          </div>

          {/* Email & Phone */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 12,
          }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={form.email}
                disabled
                style={disabledInputStyle}
              />
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>
                Email cannot be changed
              </p>
            </div>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input type="tel" value={form.phoneNumber}
                onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))}
                disabled={!isEditing}
                placeholder="08012345678"
                style={isEditing ? inputStyle : disabledInputStyle}
                onFocus={e => isEditing && (e.target.style.borderColor = '#6366f1')}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label style={labelStyle}>Bio</label>
            <textarea value={form.bio}
              onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              disabled={!isEditing}
              placeholder="Tell us a little about yourself..."
              rows={3}
              style={{
                ...isEditing ? inputStyle : disabledInputStyle,
                resize: 'vertical',
              }}
              onFocus={e => isEditing && (e.target.style.borderColor = '#6366f1')}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Daily reminder */}
          <div style={{ maxWidth: 200 }}>
            <label style={labelStyle}>Daily Reminder Time</label>
            <input type="time" value={form.dailyReminderTime}
              onChange={e => setForm(p => ({ ...p, dailyReminderTime: e.target.value }))}
              disabled={!isEditing}
              style={isEditing ? inputStyle : disabledInputStyle}
              onFocus={e => isEditing && (e.target.style.borderColor = '#6366f1')}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Save button */}
          {isEditing && (
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={() => setIsEditing(false)}
                style={{
                  padding: '10px 20px', borderRadius: 8,
                  border: '1px solid #e5e7eb', background: isDark ? '#1e293b' : 'white',
                  color: '#374151', fontWeight: 600, fontSize: 14,
                  cursor: 'pointer',
                }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={isSaving}
                style={{
                  padding: '10px 24px', borderRadius: 8,
                  border: 'none',
                  background: isSaving ? '#a5b4fc' : '#6366f1',
                  color: 'white', fontWeight: 600, fontSize: 14,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                }}>
                {isSaving ? (
                  <>
                    <span style={{
                      width: 14, height: 14,
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Account info */}
      <div style={{
        background: isDark ? '#1e293b' : 'white', borderRadius: 16,
        border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`, padding: isMobile ? 16 : 28,
        marginBottom: 16,
      }}>
        <h3 style={{
          fontSize: 15, fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827',
          margin: '0 0 16px',
        }}>
          Account Information
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            {
              label: 'Member Since',
              value: user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric',
                  })
                : 'N/A',
            },
            {
              label: 'Last Login',
              value: user?.lastLogin
                ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric',
                  })
                : 'N/A',
            },
            { label: 'Account Status', value: 'Active' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '10px 14px',
              borderRadius: 10, background: '#f9fafb',
              border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
            }}>
              <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
                {item.label}
              </span>
              <span style={{
                fontSize: 13, fontWeight: 600,
                color: item.label === 'Account Status' ? '#10b981' : '#111827',
              }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div style={{
        background: isDark ? '#1e293b' : 'white', borderRadius: 16,
        border: '1px solid #fecaca', padding: isMobile ? 16 : 28,
      }}>
        <h3 style={{
          fontSize: 15, fontWeight: 700, color: '#ef4444',
          margin: '0 0 16px',
        }}>
          Danger Zone
        </h3>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#f1f5f9' : '#111827', margin: '0 0 2px' }}>
              Delete Account
            </p>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
              Permanently delete your account and all data
            </p>
          </div>
          <button style={{
            padding: '8px 16px', borderRadius: 8,
            border: '1px solid #fecaca', background: '#fef2f2',
            color: '#ef4444', fontWeight: 600, fontSize: 13,
            cursor: 'pointer', transition: 'all 0.15s',
          }}>
            Delete Account
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}