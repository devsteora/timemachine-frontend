'use client';

import { useEffect, useState, useCallback } from 'react';
import { TimelineChart } from '@/components/charts/TimelineChart';
import { ActivityLog } from '@/types';
import { Activity, Coffee, Gauge } from 'lucide-react';
import apiClient from '@/lib/axios';

function formatMinutes(total: number): string {
  const n = Math.max(0, Math.floor(total));
  const h = Math.floor(n / 60);
  const m = n % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

interface TimelineApiResponse {
  logs: ActivityLog[];
  active_minutes: number;
  idle_minutes: number;
  flagged_minutes: number;
  avg_score: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMinutes, setActiveMinutes] = useState(0);
  const [idleMinutes, setIdleMinutes] = useState(0);
  const [avgScore, setAvgScore] = useState(0);

  const fetchTimeline = useCallback(async () => {
    try {
      const { data: payload } = await apiClient.get<TimelineApiResponse>(
        '/activity/timeline'
      );
      setData(payload.logs);
      setActiveMinutes(payload.active_minutes);
      setIdleMinutes(payload.idle_minutes);
      setAvgScore(payload.avg_score);
      setError(null);
    } catch (e: unknown) {
      console.error('Failed to fetch timeline', e);
      setError(
        e &&
          typeof e === 'object' &&
          'response' in e &&
          (e as { response?: { data?: { detail?: string } } }).response?.data
            ?.detail
          ? String(
              (e as { response: { data: { detail: string } } }).response.data
                .detail
            )
          : 'Could not load activity data.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTimeline();
    const id = setInterval(() => void fetchTimeline(), 45_000);
    return () => clearInterval(id);
  }, [fetchTimeline]);

  const metrics = [
    {
      label: 'Active time',
      value: formatMinutes(activeMinutes),
      icon: Activity,
      accent: 'from-teal-400 to-emerald-400',
      iconBg: 'bg-teal-500/15 text-teal-300',
    },
    {
      label: 'Idle time',
      value: formatMinutes(idleMinutes),
      icon: Coffee,
      accent: 'from-zinc-300 to-zinc-500',
      iconBg: 'bg-zinc-500/15 text-zinc-300',
    },
    {
      label: 'Productivity score',
      value: `${Math.round(avgScore)}%`,
      icon: Gauge,
      accent: 'from-violet-400 to-fuchsia-400',
      iconBg: 'bg-violet-500/15 text-violet-300',
    },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl space-y-10 animate-fade-in-up">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Overview
        </p>
        <h1 className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-4xl">
          Today&apos;s pulse
        </h1>
        <p className="max-w-xl text-sm text-muted">
          Live activity synced from your desktop agent (updates every minute).
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-card/60 p-6 shadow-xl shadow-black/20 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-white/[0.12] hover:shadow-teal-500/5"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted">
                  {m.label}
                </p>
                <p
                  className={`mt-3 bg-gradient-to-r bg-clip-text text-3xl font-bold tracking-tight text-transparent ${m.accent}`}
                >
                  {loading && data.length === 0 ? '—' : m.value}
                </p>
              </div>
              <div
                className={`flex size-11 items-center justify-center rounded-xl border border-white/5 transition-transform duration-500 group-hover:scale-105 ${m.iconBg}`}
              >
                <m.icon className="size-5" strokeWidth={1.75} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="glass-panel-glow overflow-hidden rounded-2xl animate-fade-in-up-delayed">
        <div className="glass-panel rounded-2xl p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Live activity stream
              </h2>
              <p className="text-sm text-muted">
                Per-minute focus scores from the desktop agent
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted sm:mt-0">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-teal-400" /> Active
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-zinc-600" /> Idle
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-rose-400" /> Flagged
              </span>
            </div>
          </div>
          {error && (
            <p className="mb-4 text-sm text-rose-400">{error}</p>
          )}
          <div className="h-[22rem] w-full md:h-96">
            {loading ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-xl border border-white/[0.05] bg-black/20">
                <div className="relative size-12">
                  <div className="absolute inset-0 rounded-full border-2 border-teal-400/20" />
                  <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-teal-400" />
                </div>
                <p className="text-sm text-muted">Loading timeline…</p>
              </div>
            ) : data.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-white/[0.05] bg-black/20 px-6 text-center">
                <p className="text-sm text-muted">
                  No desktop activity for today yet.
                </p>
                <p className="text-xs text-muted">
                  Sign in on the Enterprise Agent app with this account; metrics
                  appear within about a minute after tracking starts.
                </p>
              </div>
            ) : (
              <TimelineChart data={data} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
