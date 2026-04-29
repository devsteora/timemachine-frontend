'use client';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LogOut, Activity, Users, Mail } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-background">
      <aside className="relative flex w-64 shrink-0 flex-col border-r border-white/[0.06] bg-gradient-to-b from-primary via-primary to-secondary">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(45,212,191,0.08),transparent)]" />

        <div className="relative border-b border-white/[0.06] px-6 py-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Workspace</p>
          <p className="mt-1 text-lg font-bold tracking-tight text-white">Enterprise AI</p>
        </div>

        <nav className="relative flex flex-1 flex-col space-y-2 p-4">
          <Link
            href="/dashboard"
            className="flex items-center space-x-3 rounded-lg p-3 text-gray-300 transition hover:bg-secondary hover:text-white"
          >
            <Activity size={20} /> <span>My Analytics</span>
          </Link>

          <Link
            href="/dashboard/mail"
            className="flex items-center space-x-3 rounded-lg p-3 text-gray-300 transition hover:bg-secondary hover:text-white"
          >
            <Mail size={20} /> <span>Mail manager</span>
          </Link>

          {user?.role === 'ADMIN' && (
            <Link
              href="/dashboard/admin"
              className="flex items-center space-x-3 rounded-lg p-3 text-accent transition hover:bg-secondary"
            >
              <Users size={20} /> <span>Admin Center</span>
            </Link>
          )}
        </nav>

        <div className="relative border-t border-white/[0.06] p-4">
          <button
            type="button"
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-500 transition-all duration-300 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="size-[18px] shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="mesh-gradient relative flex-1 overflow-y-auto">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(167,139,250,0.06),transparent_50%)]" />
        <div className="relative p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
}
