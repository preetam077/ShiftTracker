'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DailyEarning } from '@/lib/types';
import { formatEuro } from '@/lib/calculations';

interface EarningsChartProps {
  data: DailyEarning[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="glass-card px-3 py-2 text-sm"
      style={{ border: '1px solid rgba(124,111,234,0.3)' }}
    >
      <p className="text-[var(--text-muted)] text-xs mb-1">{label}</p>
      <p className="text-[var(--text-primary)] font-semibold">
        {formatEuro(payload[0]?.value ?? 0)}
      </p>
      <p className="text-[var(--text-muted)] text-xs">{payload[1]?.value?.toFixed(1)}h</p>
    </div>
  );
};

export function EarningsChart({ data }: EarningsChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="glass-card p-5 fade-up fade-up-delay-1">
      <h2 className="text-[var(--text-primary)] font-semibold text-sm mb-4">
        Daily Earnings
      </h2>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c6fea" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#7c6fea" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#12d8c0" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#12d8c0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#4f566e', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#4f566e', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `€${v}`}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="earnings"
            name="Earnings"
            stroke="#7c6fea"
            strokeWidth={2}
            fill="url(#earningsGrad)"
            dot={false}
            activeDot={{ r: 5, fill: '#7c6fea', strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="hours"
            name="Hours"
            stroke="#12d8c0"
            strokeWidth={1.5}
            fill="url(#hoursGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#12d8c0', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
