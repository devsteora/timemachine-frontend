'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await apiClient.post('/auth/register', {
        email,
        password,
        role: 'EMPLOYEE',
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: unknown) {
      const detail =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { detail?: string } } }).response?.data?.detail === 'string'
          ? (err as { response: { data: { detail: string } } }).response.data.detail
          : 'Registration failed. Please try again.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 mesh-gradient">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 top-1/4 size-[26rem] rounded-full bg-violet-500/[0.11] blur-[110px] animate-pulse-soft" />
        <div className="absolute -bottom-20 left-0 size-[22rem] rounded-full bg-teal-500/[0.1] blur-[90px] animate-pulse-soft [animation-delay:0.8s]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="mb-8 flex flex-col items-center text-center animate-fade-in-up">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02] shadow-lg shadow-violet-500/10 ring-1 ring-violet-400/20 transition-transform duration-500 hover:scale-105 hover:ring-violet-400/35">
            <UserPlus className="size-7 text-violet-300" strokeWidth={1.5} />
          </div>
          <h1 className="bg-gradient-to-r from-zinc-100 via-white to-zinc-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            Create your account
          </h1>
          <p className="mt-2 max-w-sm text-sm text-muted leading-relaxed">
            Join Enterprise Time Tracker and start capturing productivity insights.
          </p>
        </div>

        <div className="glass-panel-glow rounded-2xl animate-fade-in-up-delayed">
          <div className="glass-panel rounded-2xl p-8 md:p-9">
            {error && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200"
              >
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-center text-sm text-teal-100">
                Account created. Redirecting to sign in…
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="animate-fade-in-up-delayed-2 space-y-5">
                <div>
                  <label htmlFor="reg-email" className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted">
                    Email
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    className="input-premium"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="reg-password" className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted">
                    Password
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    className="input-premium"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label htmlFor="reg-confirm" className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted">
                    Confirm password
                  </label>
                  <input
                    id="reg-confirm"
                    type="password"
                    className="input-premium"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button type="submit" className="mt-2 w-full" isLoading={loading} disabled={success}>
                Sign up
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted">
              Already registered?{' '}
              <Link
                href="/login"
                className="font-semibold text-accent transition-colors hover:text-teal-300 underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
