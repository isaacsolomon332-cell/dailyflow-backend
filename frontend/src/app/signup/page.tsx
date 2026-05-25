'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context';
import { authService } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

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

  const checkStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    setPasswordStrength(score);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'password') checkStrength(value);
    if (error) setError('');
  };

  useEffect(() => {
    if (!formData.username || formData.username.length < 3) {
      setUsernameAvailable(null); return;
    }
    setCheckingUsername(true);
    const t = setTimeout(async () => {
      try {
        const a = await authService.checkAvailability('username', formData.username);
        setUsernameAvailable(a);
      } catch { setUsernameAvailable(null); }
      finally { setCheckingUsername(false); }
    }, 600);
    return () => clearTimeout(t);
  }, [formData.username]);

  useEffect(() => {
    if (!formData.email || !formData.email.includes('@')) {
      setEmailAvailable(null); return;
    }
    setCheckingEmail(true);
    const t = setTimeout(async () => {
      try {
        const a = await authService.checkAvailability('email', formData.email);
        setEmailAvailable(a);
      } catch { setEmailAvailable(null); }
      finally { setCheckingEmail(false); }
    }, 600);
    return () => clearTimeout(t);
  }, [formData.email]);

  const strengthColor = ['', '#ef4444', '#f59e0b', '#f59e0b', '#10b981', '#10b981'][passwordStrength];
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][passwordStrength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.username || !formData.password) {
      setError('Please fill in all required fields'); return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    if (passwordStrength < 3) {
      setError('Please choose a stronger password'); return;
    }
    if (!formData.terms) {
      setError('Please accept the terms of service'); return;
    }
    setIsLoading(true);
    setError('');
    try {
      await authService.signup({
        fullName: formData.fullName,
        email: formData.email,
        username: formData.username,
        phoneNumber: formData.phoneNumber || undefined,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return null;

  const inputStyle = {
    width: '100%', padding: '13px 16px',
    borderRadius: 12, fontSize: 15, outline: 'none',
    background: '#f9fafb', color: '#111827',
    border: '2px solid #e5e7eb',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block', fontSize: 13,
    fontWeight: 600 as const, color: '#374151', marginBottom: 6,
  };

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

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 960,
        paddingTop: 16, paddingBottom: 16,
      }}>
        <div className="auth-card" style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          borderRadius: 24, overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.1fr)',
        }}>

          {/* LEFT PANEL */}
          <div className="hide-mobile" style={{
            background: 'linear-gradient(145deg, #4338ca, #312e81)',
            padding: '48px 40px',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden',
          }}>
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
                color: 'white', fontSize: 30, fontWeight: 700,
                lineHeight: 1.2, marginBottom: 16,
              }}>
                Start Your<br />
                <span style={{ color: '#a5b4fc' }}>Productivity Journey.</span>
              </h2>
              <p style={{ color: '#c7d2fe', fontSize: 14, lineHeight: 1.7, marginBottom: 36 }}>
                Join thousands of people building better habits and achieving their goals with DailyFlow.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { value: '10K+', label: 'Active Users' },
                  { value: '98%', label: 'Satisfaction' },
                  { value: '50K+', label: 'Goals Achieved' },
                  { value: '4.9★', label: 'App Rating' },
                ].map(s => (
                  <div key={s.label} style={{
                    padding: '16px 12px', borderRadius: 14, textAlign: 'center',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: 20 }}>{s.value}</div>
                    <div style={{ color: '#a5b4fc', fontSize: 12, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: 'relative', zIndex: 1, color: '#818cf8', fontSize: 13, marginTop: 32 }}>
              © 2026 DailyFlow
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="auth-right-panel" style={{
            padding: '40px 32px',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', background: 'white',
            overflowY: 'auto', maxHeight: '100vh',
          }}>
            <div style={{ maxWidth: 360, width: '100%', margin: '0 auto' }}>

              <div className="show-mobile-only" style={{
                alignItems: 'center', gap: 10, marginBottom: 24,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'linear-gradient(135deg, #6366f1, #d946ef)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, color: 'white', fontWeight: 700, flexShrink: 0,
                }}>∿</div>
                <div>
                  <div style={{ color: '#111827', fontWeight: 700, fontSize: 18 }}>DailyFlow</div>
                  <div style={{ color: '#9ca3af', fontSize: 11 }}>Productivity Suite 2026</div>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h2 style={{
                  fontSize: 26, fontWeight: 700, color: '#111827',
                  letterSpacing: '-0.5px', marginBottom: 6,
                }}>
                  Create Account
                </h2>
                <p style={{ color: '#6b7280', fontSize: 14 }}>
                  Begin your productivity journey today
                </p>
              </div>

              {error && (
                <div style={{
                  marginBottom: 16, padding: '12px 16px', borderRadius: 12,
                  background: '#fef2f2', color: '#dc2626', fontSize: 14,
                  border: '1px solid #fecaca',
                }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" name="fullName" value={formData.fullName}
                    onChange={handleChange} placeholder="John Doe"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Email <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input type="email" name="email" value={formData.email}
                      onChange={handleChange} placeholder="you@example.com"
                      style={{ ...inputStyle, paddingRight: 40 }}
                      onFocus={e => e.target.style.borderColor = '#6366f1'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                    {checkingEmail && <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 12 }}>...</span>}
                    {!checkingEmail && emailAvailable === true && <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#10b981' }}>✓</span>}
                    {!checkingEmail && emailAvailable === false && <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#ef4444' }}>✗</span>}
                  </div>
                  {emailAvailable === false && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>Email already registered</p>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Username <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <input type="text" name="username" value={formData.username}
                        onChange={handleChange} placeholder="johndoe"
                        style={{ ...inputStyle, paddingRight: 36 }}
                        onFocus={e => e.target.style.borderColor = '#6366f1'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                      {checkingUsername && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 11 }}>...</span>}
                      {!checkingUsername && usernameAvailable === true && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#10b981', fontSize: 13 }}>✓</span>}
                      {!checkingUsername && usernameAvailable === false && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#ef4444', fontSize: 13 }}>✗</span>}
                    </div>
                    {usernameAvailable === false && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 3 }}>Already taken</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input type="tel" name="phoneNumber" value={formData.phoneNumber}
                      onChange={handleChange} placeholder="08012345678"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#6366f1'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Password <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'}
                      name="password" value={formData.password}
                      onChange={handleChange} placeholder="Min. 8 characters"
                      style={{ ...inputStyle, paddingRight: 48 }}
                      onFocus={e => e.target.style.borderColor = '#6366f1'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9ca3af' }}>
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {formData.password && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= passwordStrength ? strengthColor : '#e5e7eb', transition: 'background 0.3s' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 12, color: strengthColor, fontWeight: 600 }}>{strengthLabel}</span>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Confirm Password <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input type={showConfirm ? 'text' : 'password'}
                      name="confirmPassword" value={formData.confirmPassword}
                      onChange={handleChange} placeholder="Repeat your password"
                      style={{
                        ...inputStyle, paddingRight: 48,
                        borderColor: formData.confirmPassword
                          ? formData.password === formData.confirmPassword ? '#10b981' : '#ef4444'
                          : '#e5e7eb',
                      }}
                      onFocus={e => e.target.style.borderColor = '#6366f1'}
                      onBlur={e => {
                        e.target.style.borderColor = formData.confirmPassword
                          ? formData.password === formData.confirmPassword ? '#10b981' : '#ef4444'
                          : '#e5e7eb';
                      }} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9ca3af' }}>
                      {showConfirm ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 20 }}>
                  <input type="checkbox" name="terms" checked={formData.terms}
                    onChange={handleChange}
                    style={{ width: 16, height: 16, marginTop: 2, accentColor: '#6366f1', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
                    I agree to the{' '}
                    <a href="#" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</a>
                  </span>
                </label>

                <button type="submit" disabled={isLoading}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    background: isLoading ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: 'white', fontWeight: 700, fontSize: 15,
                    boxShadow: isLoading ? 'none' : '0 4px 16px rgba(99,102,241,0.4)',
                    marginBottom: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                  {isLoading ? (
                    <>
                      <span style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                      Creating account...
                    </>
                  ) : '✨ Create Account'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>Already have an account?</span>
                  <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                </div>

                <Link href="/login" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', padding: '13px', borderRadius: 12,
                  border: '2px solid #e5e7eb', color: '#374151',
                  fontWeight: 600, fontSize: 15, textDecoration: 'none',
                  boxSizing: 'border-box',
                }}>
                  🔑 Sign In Instead
                </Link>
              </form>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
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
          .auth-right-panel { padding: 28px 20px !important; max-height: none !important; }
        }
        @media (min-width: 641px) {
          .show-mobile-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}