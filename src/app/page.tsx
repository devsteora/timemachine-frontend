'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="mesh-gradient flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="relative size-16">
        <div className="absolute inset-0 rounded-full border-2 border-teal-400/15" />
        <div className="absolute inset-0 rounded-full border-2 border-violet-400/15 [animation-delay:150ms]" />
        <div className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-t-teal-400 border-r-teal-400/40" style={{ animationDuration: '1.1s' }} />
        <div
          className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-b-violet-400/80"
          style={{ animationDuration: '0.85s', animationDirection: 'reverse' }}
        />
      </div>
      <div className="text-center animate-fade-in-up">
        <p className="text-sm font-medium tracking-wide text-muted">Enterprise Time Tracker</p>
        <p className="mt-1 text-xs text-zinc-600">Preparing your workspace…</p>
      </div>
    </div>
  );
}
