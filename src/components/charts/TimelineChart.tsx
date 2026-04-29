'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { ActivityLog } from '@/types';

interface TimelineChartProps {
  data: ActivityLog[];
}

const tooltipStyles = {
  backgroundColor: 'rgba(12, 12, 18, 0.92)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  boxShadow: '0 20px 40px -12px rgba(0,0,0,0.5)',
  padding: '10px 14px',
};

export function TimelineChart({ data }: TimelineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="minute"
          stroke="#71717a"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickMargin={10}
        />
        <YAxis hide domain={[0, 100]} />
        <Tooltip
          cursor={{ fill: 'rgba(45, 212, 191, 0.06)' }}
          contentStyle={tooltipStyles}
          labelStyle={{ color: '#a1a1aa', fontSize: 11, marginBottom: 4 }}
          itemStyle={{ color: '#f4f4f5', fontSize: 13, fontWeight: 600 }}
        />
        <Bar dataKey="score" radius={[5, 5, 0, 0]} maxBarSize={10} animationDuration={1200}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.status === 'ACTIVE'
                  ? '#2dd4bf'
                  : entry.status === 'IDLE'
                    ? '#52525b'
                    : '#fb7185'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
