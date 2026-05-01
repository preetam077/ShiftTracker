'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthPage() {
  const router = useRouter();
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  // If already logged in, redirect
  if (!authLoading && user) {
    router.replace('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error);
        } else {
          setSignUpSuccess(true);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error);
        } else {
          router.replace('/dashboard');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <Loader2 size={32} className="animate-spin text-[var(--accent-purple)]" />
      </div>
    );
  }

  if (signUpSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
        <div className="glass-card p-8 sm:p-10 w-full max-w-md text-center fade-up">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, rgba(124,111,234,0.2), rgba(18,216,192,0.2))' }}>
            <Mail size={28} className="text-[var(--accent-teal)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Check your email</h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
            We&apos;ve sent a confirmation link to <strong className="text-[var(--text-primary)]">{email}</strong>.
            Click the link to activate your account.
          </p>
          <button
            className="btn-secondary text-sm w-full justify-center"
            onClick={() => { setSignUpSuccess(false); setIsSignUp(false); }}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-md fade-up">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c6fea, #12d8c0)' }}
          >
            <Clock size={22} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-[var(--text-primary)] text-lg leading-tight">
              ShiftTracker
            </div>
            <div className="text-[var(--text-muted)] text-xs">Work Log</div>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card p-8 sm:p-10">
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h1>
          <p className="text-[var(--text-muted)] text-sm mb-6">
            {isSignUp
              ? 'Sign up to sync your shifts across devices'
              : 'Sign in to access your shifts'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[var(--text-secondary)] text-xs font-medium mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  style={{ zIndex: 2 }}
                />
                <input
                  id="auth-email"
                  type="email"
                  className="input-base"
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[var(--text-secondary)] text-xs font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  style={{ zIndex: 2 }}
                />
                <input
                  id="auth-password"
                  type="password"
                  className="input-base"
                  style={{ paddingLeft: '2.25rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
              </div>
            </div>

            {/* Confirm Password */}
            {isSignUp && (
              <div className="fade-up">
                <label className="block text-[var(--text-secondary)] text-xs font-medium mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    style={{ zIndex: 2 }}
                  />
                  <input
                    id="auth-confirm-password"
                    type="password"
                    className="input-base"
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl px-4 py-3 text-sm font-medium fade-up"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full justify-center text-sm"
              disabled={loading}
              style={{ marginTop: '1.5rem' }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center text-sm text-[var(--text-muted)]">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              className="text-[var(--accent-purple)] font-medium hover:underline"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setConfirmPassword('');
              }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[var(--text-muted)] text-xs mt-6">
          Your shifts sync securely across all devices
        </p>
      </div>
    </div>
  );
}
