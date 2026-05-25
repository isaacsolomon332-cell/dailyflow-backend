'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context';

export default function LoginPage() {
  const router = useRouter();
  
  const { user, loading, login } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  // Enhanced particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: {
      x: number; y: number; vx: number; vy: number;
      radius: number; opacity: number; color: string;
    }[] = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 3 + 1,
      opacity: Math.random() * 0.6 + 0.2,
      color: ['#818cf8', '#a78bfa', '#c4b5fd', '#6366f1', '#ffffff'][
        Math.floor(Math.random() * 5)
      ],
    }));

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(167,139,250,${0.25 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.usernameOrEmail || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await login(formData.usernameOrEmail, formData.password);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = async () => {
    setIsLoading(true);
    setError('');
    try {
      await login('demo@dailyflow.app', 'DemoPass123!');
      router.replace('/dashboard');
    } catch {
      setError('Demo account unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div style={{
      minHeight: '100vh', position: 'relative',
      overflow: 'hidden', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: 16,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 960 }}>
        {/* Card */}
        <div className="auth-card" style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          borderRadius: 24, overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.1fr)',
        }}>

          {/* LEFT PANEL — hidden on mobile */}
          <div style={{
            background: 'linear-gradient(145deg, #4338ca, #312e81)',
            padding: '48px 40px',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden',
          }}
            className="hide-mobile"
          >
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.07,
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: 'linear-gradient(135deg, #818cf8, #d946ef)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, color: 'white', fontWeight: 700,
                  boxShadow: '0 8px 20px rgba(129,140,248,0.4)',
                }}>∿</div>
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 20 }}>DailyFlow</div>
                  <div style={{ color: '#a5b4fc', fontSize: 12 }}>Productivity Suite 2026</div>
                </div>
              </div>
              <h2 style={{
                color: 'white', fontSize: 32, fontWeight: 700,
                lineHeight: 1.2, marginBottom: 16,
              }}>
                Streamline Your Day,<br />
                <span style={{ color: '#a5b4fc' }}>Amplify Your Life.</span>
              </h2>
              <p style={{ color: '#c7d2fe', fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>
                Track goals, manage projects, and build habits in one seamlessly designed dashboard.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { icon: '📅', title: 'Smart Calendar', desc: 'Plan and track daily activities' },
                  { icon: '🎯', title: 'Goal Tracking', desc: 'Set and achieve yearly objectives' },
                  { icon: '📊', title: 'Progress Analytics', desc: 'Visualize your growth journey' },
                ].map(f => (
                  <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, fontSize: 18,
                      background: 'rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>{f.icon}</div>
                    <div>
                      <div style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{f.title}</div>
                      <div style={{ color: '#a5b4fc', fontSize: 13 }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: 'relative', zIndex: 1, color: '#818cf8', fontSize: 13, marginTop: 40 }}>
              © 2026 DailyFlow
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="auth-right-panel" style={{
            padding: '40px 32px',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', background: 'white',
          }}>
            <div style={{ maxWidth: 360, width: '100%', margin: '0 auto' }}>

              {/* Mobile logo */}
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: 10, marginBottom: 28,
              }}
                className="show-mobile-only"
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'linear-gradient(135deg, #6366f1, #d946ef)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, color: 'white', fontWeight: 700,
                }}>∿</div>
                <div>
                  <div style={{ color: '#111827', fontWeight: 700, fontSize: 18 }}>DailyFlow</div>
                  <div style={{ color: '#9ca3af', fontSize: 11 }}>Productivity Suite 2026</div>
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <h2 style={{
                  fontSize: 26, fontWeight: 700, color: '#111827',
                  letterSpacing: '-0.5px', marginBottom: 6,
                }}>
                  Welcome Back
                </h2>
                <p style={{ color: '#6b7280', fontSize: 14 }}>
                  Sign in to continue your productivity journey
                </p>
              </div>

              {error && (
                <div style={{
                  marginBottom: 20, padding: '12px 16px', borderRadius: 12,
                  background: '#fef2f2', color: '#dc2626', fontSize: 14,
                  border: '1px solid #fecaca',
                }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Username */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{
                    display: 'block', fontSize: 13, fontWeight: 600,
                    color: '#374151', marginBottom: 6,
                  }}>
                    Username or Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: 14, top: '50%',
                      transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 16,
                    }}>👤</span>
                    <input type="text" name="usernameOrEmail"
                      value={formData.usernameOrEmail}
                      onChange={handleChange}
                      placeholder="Enter username or email"
                      style={{
                        width: '100%', padding: '13px 16px 13px 42px',
                        borderRadius: 12, fontSize: 15, outline: 'none',
                        background: '#f9fafb', color: '#111827',
                        border: '2px solid #e5e7eb',
                        boxSizing: 'border-box',
                      }}
                      onFocus={e => e.target.style.borderColor = '#6366f1'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{
                    display: 'block', fontSize: 13, fontWeight: 600,
                    color: '#374151', marginBottom: 6,
                  }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: 14, top: '50%',
                      transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 16,
                    }}>🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password" value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      style={{
                        width: '100%', padding: '13px 48px 13px 42px',
                        borderRadius: 12, fontSize: 15, outline: 'none',
                        background: '#f9fafb', color: '#111827',
                        border: '2px solid #e5e7eb',
                        boxSizing: 'border-box',
                      }}
                      onFocus={e => e.target.style.borderColor = '#6366f1'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                    <button type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: 14, top: '50%',
                        transform: 'translateY(-50%)', background: 'none',
                        border: 'none', cursor: 'pointer', fontSize: 16,
                        color: '#9ca3af',
                      }}>
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', marginBottom: 24,
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" name="rememberMe"
                      checked={formData.rememberMe} onChange={handleChange}
                      style={{ width: 16, height: 16, accentColor: '#6366f1' }} />
                    <span style={{ fontSize: 13, color: '#6b7280' }}>Remember me</span>
                  </label>
                  <Link href="/forgot-password" style={{
                    fontSize: 13, fontWeight: 600, color: '#6366f1', textDecoration: 'none',
                  }}>
                    Forgot password?
                  </Link>
                </div>

                {/* Sign In */}
                <button type="submit" disabled={isLoading}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12,
                    border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                    background: isLoading ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: 'white', fontWeight: 700, fontSize: 15,
                    boxShadow: isLoading ? 'none' : '0 4px 16px rgba(99,102,241,0.4)',
                    marginBottom: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                  {isLoading ? (
                    <>
                      <span style={{
                        width: 16, height: 16, border: '2px solid white',
                        borderTopColor: 'transparent', borderRadius: '50%',
                        display: 'inline-block', animation: 'spin 0.7s linear infinite',
                      }} />
                      Signing in...
                    </>
                  ) : '🚀 Sign In'}
                </button>

                {/* Divider */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
                }}>
                  <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>New to DailyFlow?</span>
                  <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                </div>

                <Link href="/signup" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', padding: '13px', borderRadius: 12,
                  border: '2px solid #e5e7eb', color: '#374151',
                  fontWeight: 600, fontSize: 15, textDecoration: 'none',
                  marginBottom: 10, boxSizing: 'border-box',
                }}>
                  ✨ Create Account
                </Link>

                <button type="button" onClick={handleDemo} disabled={isLoading}
                  style={{
                    width: '100%', padding: '11px', borderRadius: 12,
                    border: '1px solid #f3f4f6', background: '#f9fafb',
                    color: '#6b7280', fontWeight: 500, fontSize: 14, cursor: 'pointer',
                  }}>
                  🎮 Try Demo Account
                </button>
              </form>
            </div>
          </div>
        </div>

        <p style={{
          textAlign: 'center', marginTop: 20, fontSize: 13,
          color: 'rgba(255,255,255,0.5)',
        }}>
          © 2026 DailyFlow App. All rights reserved.
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #9ca3af; }
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
          .show-mobile-only { display: flex !important; }
          .auth-card { grid-template-columns: 1fr !important; }
          .auth-right-panel { padding: 28px 20px !important; }
        }
        @media (min-width: 641px) {
          .show-mobile-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}