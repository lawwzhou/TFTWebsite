'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import type { RollResult } from '@/lib/probability';

interface ChartPoint {
  roll: number;
  gold: number;
  twoStar: number;
  threeStar: number;
}

function toChartData(results: RollResult[]): ChartPoint[] {
  return results.map(r => ({
    roll: r.roll,
    gold: r.goldSpent,
    twoStar: parseFloat((r.p2Star * 100).toFixed(2)),
    threeStar: parseFloat((r.p3Star * 100).toFixed(2)),
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a24] border border-[#2e2e3e] rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1.5 font-medium">Roll {label} · {label * 2}g spent</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <p key={p.name} style={{ color: p.color }} className="mb-0.5">
          {p.name}: <span className="font-mono font-semibold">{p.value.toFixed(1)}%</span>
        </p>
      ))}
    </div>
  );
}

export default function OddsChart({ results }: { results: RollResult[] }) {
  const data = toChartData(results);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        Enter gold above to see odds
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="grad2star" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f5a623" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f5a623" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="grad3star" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />

        <XAxis
          dataKey="roll"
          stroke="#374151"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          label={{ value: 'Rolls', position: 'insideBottomRight', offset: -4, fill: '#4b5563', fontSize: 11 }}
        />
        <YAxis
          stroke="#374151"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          domain={[0, 100]}
          tickFormatter={v => `${v}%`}
        />

        <Tooltip content={<CustomTooltip />} />

        <ReferenceLine y={50} stroke="#2e2e3e" strokeDasharray="4 4" />
        <ReferenceLine y={90} stroke="#2e2e3e" strokeDasharray="4 4" />

        <Legend
          verticalAlign="top"
          align="right"
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{value}</span>}
        />

        <Area
          type="monotone"
          dataKey="twoStar"
          name="P(2★)"
          stroke="#f5a623"
          strokeWidth={2}
          fill="url(#grad2star)"
          dot={false}
          activeDot={{ r: 4, fill: '#f5a623' }}
        />
        <Area
          type="monotone"
          dataKey="threeStar"
          name="P(3★)"
          stroke="#60a5fa"
          strokeWidth={2}
          fill="url(#grad3star)"
          dot={false}
          activeDot={{ r: 4, fill: '#60a5fa' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
