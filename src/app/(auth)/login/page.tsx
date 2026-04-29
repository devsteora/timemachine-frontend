'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import apiClient from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { AuthResponse } from '@/types';
import { Timer } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
      setAuth(data.user, data.access_token);
      router.push('/dashboard');
    } catch (err: unknown) {
      const detail =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { detail?: string } } }).response?.data?.detail === 'string'
          ? (err as { response: { data: { detail: string } } }).response.data.detail
          : 'Incorrect email or password';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 mesh-gradient">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-0 size-[28rem] rounded-full bg-teal-500/[0.12] blur-[120px] animate-pulse-soft" />
        <div className="absolute -right-32 bottom-0 size-[24rem] rounded-full bg-violet-500/[0.1] blur-[100px] animate-pulse-soft [animation-delay:1s]" />
        <div className="absolute left-1/2 top-1/3 size-px -translate-x-1/2 rounded-full bg-teal-400/30 shadow-[0_0_120px_60px_rgba(45,212,191,0.06)]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="mb-8 flex flex-col items-center text-center animate-fade-in-up">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02] shadow-lg shadow-teal-500/10 ring-1 ring-teal-400/20 transition-transform duration-500 hover:scale-105 hover:ring-teal-400/35">
            <Timer className="size-7 text-teal-400" strokeWidth={1.5} />
          </div>
          <h1 className="bg-gradient-to-r from-zinc-100 via-white to-zinc-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            Welcome back
          </h1>
          <p className="mt-2 max-w-sm text-sm text-muted leading-relaxed">
            Sign in to your workspace and pick up where productive time left off.
          </p>
        </div>

        <div className="glass-panel-glow rounded-2xl animate-fade-in-up-delayed">
          <div className="glass-panel rounded-2xl p-8 md:p-9">
            {error && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200 animate-fade-in"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="animate-fade-in-up-delayed-2 space-y-5">
                <div>
                  <label htmlFor="login-email" className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted">
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    className="input-premium"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="login-password" className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    className="input-premium"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="mt-2 w-full" isLoading={loading}>
                Sign in
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted">
              New here?{' '}
              <Link
                href="/register"
                className="font-semibold text-accent transition-colors hover:text-teal-300 underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
