import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

interface CreateAccountPageProps {
  onAccountCreated: () => void;
  onBackToLogin: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const ROLES = ['QA Engineer', 'SDET', 'QA Lead', 'Engineering Manager', 'DevOps Engineer', 'Product Manager'];

export const CreateAccountPage: React.FC<CreateAccountPageProps> = ({
  onAccountCreated,
  onBackToLogin,
  theme,
  onToggleTheme,
}) => {
  const [fullName, setFullName]         = useState('');
  const [email, setEmail]               = useState('');
  const [role, setRole]                 = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirm]   = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState('');

  const passwordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6)  return { level: 1, label: 'Weak',   color: 'var(--status-danger)' };
    if (password.length < 10) return { level: 2, label: 'Fair',   color: 'var(--status-warning)' };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { level: 3, label: 'Good', color: 'var(--accent-blue)' };
    return { level: 4, label: 'Strong', color: 'var(--status-success)' };
  };

  const strength = passwordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim())    { setError('Please enter your email address.'); return; }
    if (!role)            { setError('Please select your role.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setError('');
    setIsLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(credential.user, { displayName: fullName.trim() });
      onAccountCreated();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else {
        setError('Account creation failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const iconStyle = {
    position: 'absolute' as const, left: '16px', top: '50%',
    transform: 'translateY(-50%)', display: 'flex',
    alignItems: 'center', pointerEvents: 'none' as const,
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative',
    }}>

      {/* Theme toggle */}
      <button
        className="theme-toggle-btn"
        onClick={onToggleTheme}
        style={{ position: 'fixed', top: '28px', right: '32px', zIndex: 100 }}
      >
        {theme === 'dark' ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            Light
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            Dark
          </>
        )}
      </button>

      {/* Card */}
      <div className="glass-card" style={{
        width: '100%', maxWidth: '460px',
        display: 'flex', flexDirection: 'column', gap: '28px',
        padding: '48px 44px',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%)',
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', fontWeight: '800', color: 'white',
            boxShadow: '0 0 24px rgba(59, 130, 246, 0.4)',
          }}>Q</div>
          <div>
            <h1 style={{
              fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.03em',
              fontFamily: 'var(--font-display)',
              background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #22d3ee 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Create Account
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
              Join QEVantage™ Intelligence Platform
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--glass-border)' }} />

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Full Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--label-color)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <span style={iconStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Jane Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-with-icon"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--label-color)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <span style={iconStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-with-icon"
                required
              />
            </div>
          </div>

          {/* Role selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--label-color)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Role
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`segment-selector-btn ${role === r ? 'active-blue' : ''}`}
                  style={{ flex: 'unset', minHeight: '36px', fontSize: '0.78rem', padding: '6px 14px', borderRadius: '20px' }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--label-color)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={iconStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-with-icon-both"
                required
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                {showPassword
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>

            {/* Password strength bar */}
            {strength && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} style={{
                      flex: 1, height: '3px', borderRadius: '2px',
                      background: n <= strength.level ? strength.color : 'var(--bg-tertiary)',
                      transition: 'background 0.3s ease',
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.72rem', color: strength.color, fontWeight: '700' }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--label-color)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={iconStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={confirmPassword && confirmPassword === password ? 'var(--status-success)' : 'var(--text-muted)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </span>
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirm(e.target.value)}
                className="input-with-icon-both"
                required
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                {showConfirm
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px', fontSize: '0.82rem', color: 'var(--status-danger)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ width: '100%', marginTop: '4px', padding: '0 24px', height: '52px', fontSize: '0.95rem', justifyContent: 'center' }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1.5s linear infinite' }}>
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
                Creating Account...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
                Create Account
              </span>
            )}
          </button>

          {/* Back to login */}
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-4px' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={onBackToLogin}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)', fontWeight: '700', fontSize: '0.85rem', fontFamily: 'var(--font-sans)', padding: 0 }}
            >
              Sign In
            </button>
          </p>
        </form>

      </div>
    </div>
  );
};
