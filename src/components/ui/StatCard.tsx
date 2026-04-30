import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: ReactNode;
  accentColor?: string;
  delay?: number;
}

export function StatCard({ label, value, sub, icon, accentColor = '#7c6fea', delay = 0 }: StatCardProps) {
  const delays = ['fade-up', 'fade-up fade-up-delay-1', 'fade-up fade-up-delay-2', 'fade-up fade-up-delay-3', 'fade-up fade-up-delay-4'];
  const cls = delays[delay] ?? 'fade-up';

  return (
    <div className={`stat-card ${cls}`}>
      {/* Icon bubble */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}30` }}
      >
        <span style={{ color: accentColor }}>{icon}</span>
      </div>
      <p className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-[var(--text-primary)] text-2xl font-bold leading-tight">{value}</p>
      {sub && <p className="text-[var(--text-muted)] text-xs mt-1">{sub}</p>}
    </div>
  );
}
