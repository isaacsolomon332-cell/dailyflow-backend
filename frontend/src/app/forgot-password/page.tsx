'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Particle animation
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
      radius: number; opacity: number;
    }[] = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
    }));
    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139,92,246,${0.12 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.opacity})`;
        ctx.fill();
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

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const checkStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    setPasswordStrength(score);
  };

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setIsLoading(true);
    setError('');
    // Since backend doesn't have this endpoint yet,
    // we simulate it for now
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      setCountdown(300);
    }, 1500);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleVerifyCode = () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 1000);
  };

  const handleResetPassword = () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (passwordStrength < 3) {
      setError('Please choose a stronger password');
      return;
    }
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      setIsLoading(false);
      setStep(4);
    }, 1500);
  };

  const strengthColor = ['', '#ef4444', '#f59e0b', '#f59e0b', '#10b981', '#10b981'][passwordStrength];
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][passwordStrength];

  const inputStyle = {
    width: '100%',
    padding: '13px 16px',
    borderRadius: 12,
    fontSize: 15,
    outline: 'none',
    background: '#f9fafb',
    color: '#111827',
    border: '2px solid #e5e7eb',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box' as const,
  };

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>

      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />

      <div className="relative w-full max-w-md" style={{ zIndex: 1 }}>
        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          {/* Top bar */}
          <div style={{
            background: 'linear-gradient(135deg, #4338ca, #312e81)',
            padding: '24px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'linear-gradient(135deg, #818cf8, #d946ef)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: 'white', fontWeight: 700,
            }}>∿</div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 17 }}>DailyFlow</div>
              <div style={{ color: '#a5b4fc', fontSize: 12 }}>Password Recovery</div>
            </div>
          </div>

          {/* Step indicator */}
          {step < 4 && (
            <div style={{
              padding: '20px 32px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}>
              {[1, 2, 3].map((s) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700,
                    background: step >= s
                      ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                      : '#f3f4f6',
                    color: step >= s ? 'white' : '#9ca3af',
                    transition: 'all 0.3s',
                    boxShadow: step === s ? '0 4px 12px rgba(99,102,241,0.4)' : 'none',
                  }}>
                    {step > s ? '✓' : s}
                  </div>
                  {s < 3 && (
                    <div style={{
                      width: 40, height: 2, borderRadius: 99,
                      background: step > s
                        ? 'linear-gradient(90deg, #6366f1, #4f46e5)'
                        : '#e5e7eb',
                      transition: 'all 0.3s',
                    }} />
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ padding: '24px 32px 32px' }}>

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: 16, padding: '12px 16px', borderRadius: 12,
                background: '#fef2f2', color: '#dc2626', fontSize: 14,
                border: '1px solid #fecaca',
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* STEP 1 - Email */}
            {step === 1 && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{
                    fontSize: 24, fontWeight: 700, color: '#111827',
                    marginBottom: 8,
                  }}>
                    Reset Password
                  </h2>
                  <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>
                    Enter your email address and we'll send you a verification code.
                  </p>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{
                    display: 'block', fontSize: 14, fontWeight: 600,
                    color: '#374151', marginBottom: 8,
                  }}>
                    Email Address
                  </label>
                  <input
                    type="email" value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@example.com"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <button onClick={handleSendCode} disabled={isLoading}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12,
                    border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                    background: isLoading ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: 'white', fontWeight: 700, fontSize: 15,
                    boxShadow: isLoading ? 'none' : '0 4px 16px rgba(99,102,241,0.4)',
                    marginBottom: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                  {isLoading ? (
                    <>
                      <span style={{
                        width: 16, height: 16, border: '2px solid white',
                        borderTopColor: 'transparent', borderRadius: '50%',
                        display: 'inline-block', animation: 'spin 0.7s linear infinite',
                      }} />
                      Sending code...
                    </>
                  ) : '📧 Send Reset Code'}
                </button>

                <Link href="/login" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 6, color: '#6366f1', fontSize: 14, fontWeight: 600,
                  textDecoration: 'none',
                }}>
                  ← Back to Sign In
                </Link>
              </div>
            )}

            {/* STEP 2 - Verify Code */}
            {step === 2 && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                    Enter Code
                  </h2>
                  <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>
                    We sent a 6-digit code to{' '}
                    <strong style={{ color: '#374151' }}>{email}</strong>
                  </p>
                </div>

                {/* Code inputs */}
                <div style={{
                  display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20,
                }}>
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      id={`code-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleCodeChange(i, e.target.value)}
                      onKeyDown={e => handleCodeKeyDown(i, e)}
                      style={{
                        width: 48, height: 56, textAlign: 'center',
                        fontSize: 22, fontWeight: 700, borderRadius: 12,
                        outline: 'none', transition: 'all 0.2s',
                        background: digit ? '#eef2ff' : '#f9fafb',
                        border: `2px solid ${digit ? '#6366f1' : '#e5e7eb'}`,
                        color: '#111827',
                      }}
                      onFocus={e => e.target.style.borderColor = '#6366f1'}
                      onBlur={e => {
                        e.target.style.borderColor = digit ? '#6366f1' : '#e5e7eb';
                      }}
                    />
                  ))}
                </div>

                {/* Countdown */}
                {countdown > 0 && (
                  <p style={{
                    textAlign: 'center', color: '#6b7280', fontSize: 14,
                    marginBottom: 20,
                  }}>
                    Code expires in{' '}
                    <span style={{
                      color: '#6366f1', fontWeight: 700,
                      fontFamily: 'monospace',
                      background: '#eef2ff', padding: '2px 8px', borderRadius: 6,
                    }}>
                      {formatCountdown(countdown)}
                    </span>
                  </p>
                )}

                <button onClick={handleVerifyCode} disabled={isLoading}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    background: isLoading ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: 'white', fontWeight: 700, fontSize: 15,
                    boxShadow: isLoading ? 'none' : '0 4px 16px rgba(99,102,241,0.4)',
                    marginBottom: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                  {isLoading ? (
                    <>
                      <span style={{
                        width: 16, height: 16, border: '2px solid white',
                        borderTopColor: 'transparent', borderRadius: '50%',
                        display: 'inline-block', animation: 'spin 0.7s linear infinite',
                      }} />
                      Verifying...
                    </>
                  ) : '✓ Verify Code'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button onClick={() => { setStep(1); setCode(['','','','','','']); setError(''); }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#6366f1', fontSize: 14, fontWeight: 600,
                    }}>
                    ← Change Email
                  </button>
                  <button
                    onClick={() => { setCode(['','','','','','']); setCountdown(300); }}
                    disabled={countdown > 0}
                    style={{
                      background: 'none', border: 'none',
                      cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                      color: countdown > 0 ? '#9ca3af' : '#6366f1',
                      fontSize: 14, fontWeight: 600,
                    }}>
                    Resend Code
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 - New Password */}
            {step === 3 && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                    New Password
                  </h2>
                  <p style={{ color: '#6b7280', fontSize: 14 }}>
                    Choose a strong password for your account.
                  </p>
                </div>

                {/* New Password */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{
                    display: 'block', fontSize: 14, fontWeight: 600,
                    color: '#374151', marginBottom: 8,
                  }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); checkStrength(e.target.value); setError(''); }}
                      placeholder="Min. 8 characters"
                      style={{ ...inputStyle, paddingRight: 48 }}
                      onFocus={e => e.target.style.borderColor = '#6366f1'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: 12, top: '50%',
                        transform: 'translateY(-50%)', background: 'none',
                        border: 'none', cursor: 'pointer', fontSize: 16, color: '#9ca3af',
                      }}>
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {newPassword && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} style={{
                            flex: 1, height: 3, borderRadius: 99,
                            background: i <= passwordStrength ? strengthColor : '#e5e7eb',
                            transition: 'background 0.3s',
                          }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 12, color: strengthColor, fontWeight: 600 }}>
                        {strengthLabel}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{
                    display: 'block', fontSize: 14, fontWeight: 600,
                    color: '#374151', marginBottom: 8,
                  }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                      placeholder="Repeat your password"
                      style={{
                        ...inputStyle, paddingRight: 48,
                        borderColor: confirmPassword
                          ? newPassword === confirmPassword ? '#10b981' : '#ef4444'
                          : '#e5e7eb',
                      }}
                      onFocus={e => e.target.style.borderColor = '#6366f1'}
                      onBlur={e => {
                        e.target.style.borderColor = confirmPassword
                          ? newPassword === confirmPassword ? '#10b981' : '#ef4444'
                          : '#e5e7eb';
                      }}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      style={{
                        position: 'absolute', right: 12, top: '50%',
                        transform: 'translateY(-50%)', background: 'none',
                        border: 'none', cursor: 'pointer', fontSize: 16, color: '#9ca3af',
                      }}>
                      {showConfirm ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button onClick={handleResetPassword} disabled={isLoading}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    background: isLoading ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: 'white', fontWeight: 700, fontSize: 15,
                    boxShadow: isLoading ? 'none' : '0 4px 16px rgba(99,102,241,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                  {isLoading ? (
                    <>
                      <span style={{
                        width: 16, height: 16, border: '2px solid white',
                        borderTopColor: 'transparent', borderRadius: '50%',
                        display: 'inline-block', animation: 'spin 0.7s linear infinite',
                      }} />
                      Resetting...
                    </>
                  ) : '🔐 Reset Password'}
                </button>
              </div>
            )}

            {/* STEP 4 - Success */}
            {step === 4 && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32,
                  boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
                }}>
                  ✓
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                  Password Reset!
                </h2>
                <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
                  Your password has been updated successfully. You can now sign in with your new password.
                </p>
                <Link href="/login" style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', padding: '14px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: 'white', fontWeight: 700, fontSize: 15,
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                }}>
                  🚀 Go to Sign In
                </Link>
              </div>
            )}
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
      `}</style>
    </div>
  );
}