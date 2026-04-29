'use client';

import { useCallback, useEffect, useState } from 'react';
import apiClient from '@/lib/axios';
import { Mail, Send, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PRESETS = [
  {
    id: 'eod',
    label: 'EOD deliverable update',
    subject: 'EOD deliverable update',
    body: `Hi,

Here's my end-of-day summary:

Completed today:
• 

In progress:
• 

Blockers / risks:
• 

Thanks,`,
  },
  {
    id: 'status',
    label: 'Status / unblock',
    subject: 'Quick status update',
    body: `Hi,

Quick update:

Current focus:


Need from you:


Thanks,`,
  },
  {
    id: 'leave',
    label: 'Leave / availability',
    subject: 'Availability notice',
    body: `Hi,

I wanted to let you know:


Thanks,`,
  },
] as const;

interface ManagerRow {
  name: string;
  email: string;
}

export default function MailToManagerPage() {
  const [managers, setManagers] = useState<ManagerRow[]>([]);
  const [assignedEmail, setAssignedEmail] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [loadingCtx, setLoadingCtx] = useState(true);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );

  const loadComposeContext = useCallback(async () => {
    setLoadingCtx(true);
    try {
      const { data } = await apiClient.get<{
        managers: ManagerRow[];
        assigned_manager_email: string | null;
      }>('/mail/compose-context');
      setManagers(data.managers);
      setAssignedEmail(data.assigned_manager_email ?? null);

      const assigned = data.assigned_manager_email?.trim().toLowerCase() ?? '';
      const match = data.managers.find(
        (m) => m.email.trim().toLowerCase() === assigned
      );
      if (match) {
        setRecipientEmail(match.email);
      } else if (data.managers.length > 0) {
        setRecipientEmail('');
      }
      setMessage(null);
    } catch {
      setManagers([]);
      setAssignedEmail(null);
      setRecipientEmail('');
    } finally {
      setLoadingCtx(false);
    }
  }, []);

  useEffect(() => {
    void loadComposeContext();
  }, [loadComposeContext]);

  const applyPreset = (id: (typeof PRESETS)[number]['id']) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setSubject(p.subject);
    setBody(p.body);
    setMessage(null);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim()) return;
    setMessage(null);
    setSending(true);
    try {
      const { data } = await apiClient.post<{ sent_to: string }>(
        '/mail/send-to-manager',
        {
          subject: subject.trim(),
          body: body.trim(),
          recipient_email: recipientEmail.trim(),
        }
      );
      setMessage({
        type: 'ok',
        text: `Message sent to ${data.sent_to}.`,
      });
    } catch (err: unknown) {
      const detail =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      setMessage({
        type: 'err',
        text:
          typeof detail === 'string'
            ? detail
            : 'Could not send. Check server email settings and recipient.',
      });
    } finally {
      setSending(false);
    }
  };

  const canSend =
    Boolean(recipientEmail.trim()) && Boolean(subject.trim()) && Boolean(body.trim());

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/15 text-teal-600">
            <Mail className="size-6" aria-hidden />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Mail your manager
            </h1>
            <p className="mt-1 text-gray-500">
              Send EOD updates, deliverables, and status notes to your reporting manager.
            </p>
          </div>
        </div>
      </header>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-3 border-b border-gray-100 pb-5">
          <UserCircle className="mt-0.5 size-5 shrink-0 text-gray-400" />
          <div className="min-w-0 flex-1 space-y-2">
            <label htmlFor="mgr-select" className="text-sm font-medium text-gray-900">
              Recipient manager
            </label>
            {loadingCtx ? (
              <p className="text-sm text-gray-500">Loading directory…</p>
            ) : managers.length === 0 ? (
              <p className="text-sm text-amber-700">
                No managers are configured on the server yet.
              </p>
            ) : (
              <>
                <select
                  id="mgr-select"
                  className="mt-1 w-full max-w-lg rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none ring-teal-500/30 focus:border-teal-500 focus:ring-2"
                  value={recipientEmail}
                  onChange={(e) => {
                    setRecipientEmail(e.target.value);
                    setMessage(null);
                  }}
                  required
                >
                  <option value="">Select manager…</option>
                  {managers.map((m) => (
                    <option key={m.email} value={m.email}>
                      {m.name} — {m.email}
                    </option>
                  ))}
                </select>
                {assignedEmail ? (
                  <p className="text-xs text-gray-500">
                    Profile assignment:{' '}
                    <span className="font-medium text-teal-700">{assignedEmail}</span>
                    {recipientEmail &&
                    assignedEmail.trim().toLowerCase() !==
                      recipientEmail.trim().toLowerCase()
                      ? ' (you chose a different recipient above)'
                      : null}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Choose who should receive this message. Your admin can also set a default
                    reporting manager under Admin → Reporting.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSend} className="mt-6 space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Templates</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
                  onClick={() => applyPreset(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="subj" className="mb-1 block text-sm font-medium text-gray-700">
              Subject
            </label>
            <input
              id="subj"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none ring-teal-500/30 focus:border-teal-500 focus:ring-2"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="EOD deliverable update"
              required
              disabled={!managers.length}
            />
          </div>

          <div>
            <label htmlFor="body" className="mb-1 block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="body"
              rows={14}
              className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 font-mono text-sm text-gray-900 outline-none ring-teal-500/30 focus:border-teal-500 focus:ring-2"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your update…"
              required
              disabled={!managers.length}
            />
          </div>

          {message && (
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                message.type === 'ok'
                  ? 'border border-green-200 bg-green-50 text-green-800'
                  : 'border border-red-200 bg-red-50 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <Button
            type="submit"
            className="inline-flex items-center gap-2"
            disabled={!canSend || sending || loadingCtx}
            isLoading={sending}
          >
            <Send className="size-4" />
            Send to manager
          </Button>
        </form>
      </div>
    </div>
  );
}
