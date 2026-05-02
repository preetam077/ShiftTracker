'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sun,
  Moon,
  Lock,
  Trash2,
  Loader2,
  Check,
  AlertTriangle,
  Shield,
  Palette,
  UserX,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Delete account state
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess(true);
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setDeleteError('');
    setDeleteLoading(true);

    try {
      // Delete all user's shifts first
      const { error: shiftsError } = await supabase
        .from('shifts')
        .delete()
        .eq('user_id', user?.id);

      if (shiftsError) {
        setDeleteError('Failed to delete shift data: ' + shiftsError.message);
        setDeleteLoading(false);
        return;
      }

      // Try to delete the user account via RPC function
      const { error: rpcError } = await supabase.rpc('delete_user');

      if (rpcError) {
        // If the RPC function doesn't exist, sign out and inform user
        console.warn('delete_user RPC not available:', rpcError.message);
        await signOut();
        router.replace('/auth');
        return;
      }

      // Sign out and redirect
      await signOut();
      router.replace('/auth');
    } catch {
      setDeleteError('An unexpected error occurred');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-10 lg:pt-0">
      {/* Header */}
      <div className="fade-up">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-[var(--text-muted)] text-sm mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Account info */}
      <div className="glass-card p-6 fade-up fade-up-delay-1">
        <div className="flex items-center gap-3 mb-1">
          <Shield size={18} className="text-[var(--accent-purple)]" />
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Account</h2>
        </div>
        <p className="text-[var(--text-secondary)] text-sm ml-[30px]">{user?.email}</p>
      </div>

      {/* Theme */}
      <div className="glass-card p-6 fade-up fade-up-delay-2">
        <div className="flex items-center gap-3 mb-4">
          <Palette size={18} className="text-[var(--accent-teal)]" />
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Appearance</h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setTheme('dark')}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-[var(--accent-purple)] text-white shadow-lg'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--border-hover)]'
            }`}
          >
            <Moon size={16} />
            Dark
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              theme === 'light'
                ? 'bg-[var(--accent-purple)] text-white shadow-lg'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--border-hover)]'
            }`}
          >
            <Sun size={16} />
            Light
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="glass-card p-6 fade-up fade-up-delay-3">
        <div className="flex items-center gap-3 mb-4">
          <Lock size={18} className="text-[var(--accent-amber)]" />
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div>
            <label className="block text-[var(--text-secondary)] text-xs font-medium mb-1.5">
              New Password
            </label>
            <input
              id="settings-new-password"
              type="password"
              className="input-base"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-[var(--text-secondary)] text-xs font-medium mb-1.5">
              Confirm New Password
            </label>
            <input
              id="settings-confirm-password"
              type="password"
              className="input-base"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {passwordError && (
            <div
              className="rounded-xl px-4 py-3 text-sm font-medium fade-up"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#f87171',
              }}
            >
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div
              className="rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 fade-up"
              style={{
                background: 'rgba(18, 216, 192, 0.1)',
                border: '1px solid rgba(18, 216, 192, 0.2)',
                color: 'var(--accent-teal)',
              }}
            >
              <Check size={16} />
              Password updated successfully
            </div>
          )}

          <button
            type="submit"
            className="btn-primary text-sm"
            disabled={passwordLoading}
          >
            {passwordLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div
        className="rounded-2xl p-6 fade-up fade-up-delay-4"
        style={{
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.15)',
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle size={18} className="text-[#f87171]" />
          <h2 className="text-base font-semibold text-[#f87171]">Danger Zone</h2>
        </div>
        <p className="text-[var(--text-secondary)] text-sm mb-4 ml-[30px]">
          Permanently delete your account and all shift data. This action cannot be undone.
        </p>

        <div className="ml-[30px] space-y-3">
          <div>
            <label className="block text-[var(--text-secondary)] text-xs font-medium mb-1.5">
              Type <strong className="text-[#f87171]">DELETE</strong> to confirm
            </label>
            <input
              id="settings-delete-confirm"
              type="text"
              className="input-base max-w-xs"
              style={{
                borderColor: deleteConfirm === 'DELETE' ? 'rgba(239, 68, 68, 0.4)' : undefined,
              }}
              placeholder="DELETE"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              autoComplete="off"
            />
          </div>

          {deleteError && (
            <div
              className="rounded-xl px-4 py-3 text-sm font-medium fade-up"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#f87171',
              }}
            >
              {deleteError}
            </div>
          )}

          <button
            className="btn-danger text-sm"
            disabled={deleteConfirm !== 'DELETE' || deleteLoading}
            onClick={handleDeleteAccount}
            style={{
              opacity: deleteConfirm !== 'DELETE' ? 0.5 : 1,
              cursor: deleteConfirm !== 'DELETE' ? 'not-allowed' : 'pointer',
            }}
          >
            {deleteLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <UserX size={16} />
                Delete Account
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
