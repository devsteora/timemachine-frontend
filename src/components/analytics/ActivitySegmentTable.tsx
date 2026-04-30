'use client';

import { useEffect, useState } from 'react';
import type { ActivityTimelineSegment } from '@/types';

function formatClock(d: Date): string {
  return d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function formatSegmentDuration(start: Date, end: Date | null, nowMs: number): string {
  const endMs = end ? end.getTime() : nowMs;
  const sec = Math.max(0, Math.floor((endMs - start.getTime()) / 1000));
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const r = sec % 60;
  return r ? `${m}m ${r}s` : `${m}m`;
}

function rowClassName(activity: string, index: number): string {
  const stripe = index % 2 === 0 ? 'bg-white/[0.02]' : 'bg-white/[0.035]';
  if (activity === 'Working') return `${stripe} border-l-2 border-l-teal-400/45`;
  if (activity.includes('Break')) return `${stripe} border-l-2 border-l-violet-400/45`;
  return `${stripe} border-l-2 border-l-zinc-500/40`;
}

interface ActivitySegmentTableProps {
  segments: ActivityTimelineSegment[];
}

export function ActivitySegmentTable({ segments }: ActivitySegmentTableProps) {
  const hasOpenSegment = segments.some((s) => s.end_at === null);
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    if (!hasOpenSegment) return;
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [hasOpenSegment]);

  if (segments.length === 0) {
    return (
      <p className="rounded-xl border border-white/[0.05] bg-black/15 px-4 py-6 text-center text-sm text-muted">
        No segment detail for this period yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-white/[0.08] text-muted">
            <th className="pb-2.5 pr-3 pl-3 pt-3 font-medium">Start time</th>
            <th className="pb-2.5 pr-3 pt-3 font-medium">End time</th>
            <th className="pb-2.5 pr-3 pt-3 font-medium">Activity Status</th>
            <th className="pb-2.5 pr-3 pt-3 font-medium">Duration</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((seg, index) => {
            const start = new Date(seg.start_at);
            const end = seg.end_at ? new Date(seg.end_at) : null;
            return (
              <tr
                key={seg.id}
                className={`border-b border-white/[0.05] last:border-b-0 ${rowClassName(seg.activity, index)}`}
              >
                <td className="py-2.5 pr-3 pl-3 text-zinc-200">{formatClock(start)}</td>
                <td className="py-2.5 pr-3 text-zinc-200">{end ? formatClock(end) : ''}</td>
                <td className="py-2.5 pr-3 align-top">
                  <div className="font-medium text-white">{seg.activity}</div>
                  {seg.note ? (
                    <div className="mt-0.5 max-w-[200px] text-[10px] leading-snug text-muted">
                      {seg.note}
                    </div>
                  ) : null}
                </td>
                <td className="py-2.5 pr-3 text-zinc-300">
                  {formatSegmentDuration(start, end, nowTick)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
