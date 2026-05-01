'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  Clock,
  LogOut,
  Menu,
  Plus,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/shifts', label: 'Shift History', icon: CalendarDays },
  { href: '/shifts/new', label: 'Add Shift', icon: Plus },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <>
      {/* Mobile toggle — only show hamburger when sidebar is closed */}
      {!open && (
        <button
          className="fixed top-4 left-4 p-2.5 rounded-xl btn-secondary lg:hidden"
          style={{ zIndex: 50 }}
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden"
          style={{ zIndex: 40 }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64
          flex flex-col
          bg-[var(--bg-surface)] border-r border-[var(--border)]
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
        style={{ zIndex: 45 }}
      >
        {/* Logo + Close button row */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-[var(--border)]">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c6fea, #12d8c0)' }}>
              <Clock size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-[var(--text-primary)] text-base leading-tight">
                ShiftTracker
              </div>
              <div className="text-[var(--text-muted)] text-xs">Work Log</div>
            </div>
          </Link>

          {/* Close button — inside sidebar header, only on mobile */}
          <button
            className="btn-ghost p-1.5 rounded-lg flex-shrink-0 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Navigation
          </p>
          {NAV.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 group relative
                  ${isActive
                    ? 'text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                  }
                `}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, rgba(124,111,234,0.25), rgba(18,216,192,0.1))' }} />
                )}
                <Icon
                  size={18}
                  className={`relative z-10 flex-shrink-0 transition-colors ${isActive ? 'text-[var(--accent-purple)]' : ''}`}
                />
                <span className="relative z-10 flex-1">{label}</span>
                {isActive && (
                  <ChevronRight size={14} className="relative z-10 text-[var(--accent-purple)] opacity-60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] space-y-3">
          {user && (
            <div className="flex items-center gap-2">
              <p className="text-[var(--text-muted)] text-xs truncate flex-1" title={user.email ?? ''}>
                {user.email}
              </p>
              <button
                onClick={signOut}
                className="btn-ghost p-1.5 rounded-lg flex-shrink-0"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
          <p className="text-[var(--text-muted)] text-xs">
            Synced with cloud · <span className="text-[var(--accent-teal)]">v2.0</span>
          </p>
        </div>
      </aside>
    </>
  );
}
