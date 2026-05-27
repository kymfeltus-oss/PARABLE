'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { isParableDevGuestClientEnabled } from '@/lib/parable-dev-guest';
import { AMEN_REACTION_EVENT, streamInteractionChannelName } from '@/lib/stream-interactions';
import { createClient } from '@/utils/supabase/client';

interface ScheduledBroadcast {
  id: string;
  title: string;
  scheduled_start: string;
  estimated_duration_mins: number;
}

export default function StreamerDashboardPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [schedule, setSchedule] = useState<ScheduledBroadcast[]>([]);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [amenCount, setAmenCount] = useState(0);
  const [scheduleNotice, setScheduleNotice] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newDuration, setNewDuration] = useState(60);

  useEffect(() => {
    if (!userProfile?.id) return;

    let cancelled = false;

    async function loadStreamerSchedules() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const url =
        session?.access_token || !isParableDevGuestClientEnabled()
          ? '/api/broadcast/schedule'
          : `/api/broadcast/schedule?userId=${encodeURIComponent(userProfile.id)}`;

      const res = await fetch(url, { credentials: 'same-origin', headers });
      const payload = (await res.json().catch(() => ({}))) as {
        schedule?: ScheduledBroadcast[];
        notice?: string;
        error?: string;
      };

      if (cancelled) return;

      if (!res.ok) {
        console.error('[streamer-dashboard] Failed to load schedule:', payload.error ?? res.status);
        return;
      }

      setSchedule(payload.schedule ?? []);
      setScheduleNotice(typeof payload.notice === 'string' ? payload.notice : null);
    }

    const interactionChannel = supabase
      .channel(streamInteractionChannelName(userProfile.id))
      .on('broadcast', { event: AMEN_REACTION_EVENT }, () => {
        setAmenCount((prev) => prev + 1);
      })
      .subscribe();

    void loadStreamerSchedules();

    return () => {
      cancelled = true;
      void supabase.removeChannel(interactionChannel);
    };
  }, [supabase, userProfile?.id]);

  const handlePayoutOnboarding = async () => {
    if (!userProfile?.id) return;

    setIsOnboarding(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userEmail =
        session?.user?.email ??
        (typeof userProfile.email === 'string' ? userProfile.email : undefined);

      const res = await fetch('/api/checkout/connect/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userProfile.id, userEmail }),
      });

      const raw = await res.text();
      let data: { url?: string; error?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        data = { error: raw.trim() || `Onboarding failed (HTTP ${res.status}).` };
      }

      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }

      alert(data.error || 'Unable to start Stripe Connect onboarding.');
    } catch (err) {
      console.error('Stripe connect integration route failure:', err);
      alert('Network error during payout setup. Please try again.');
    } finally {
      setIsOnboarding(false);
    }
  };

  const handleCreateSchedule = async (e: FormEvent) => {
    e.preventDefault();
    if (!userProfile?.id || !newTitle.trim() || !newStart) return;

    setIsSavingSchedule(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/broadcast/schedule', {
        method: 'POST',
        headers,
        credentials: 'same-origin',
        body: JSON.stringify({
          title: newTitle.trim(),
          scheduled_start: new Date(newStart).toISOString(),
          estimated_duration_mins: Number(newDuration),
        }),
      });

      const payload = (await res.json().catch(() => ({}))) as {
        event?: ScheduledBroadcast;
        error?: string;
      };

      if (!res.ok || !payload.event) {
        alert(payload.error || 'Failed to publish broadcast event.');
        return;
      }

      setSchedule((prev) =>
        [...prev, payload.event!].sort(
          (a, b) =>
            new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime(),
        ),
      );
      setNewTitle('');
      setNewStart('');
    } catch (err) {
      console.error('[streamer-dashboard] schedule create failed:', err);
      alert('Network error while saving schedule.');
    } finally {
      setIsSavingSchedule(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-[#02040A] text-sm text-white/50">
        Loading streamer hub…
      </div>
    );
  }

  if (!userProfile?.id) {
    return (
      <div className="relative min-h-screen bg-[#02040A] p-6 text-[#F8FAFC]">
        <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center text-center">
          <p className="text-sm text-white/60">Sign in to open the Streamer Operational Hub.</p>
          <Link
            href="/login"
            className="mt-6 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#0EA5E9] px-5 py-3 text-sm font-bold text-[#02040A]"
          >
            Sign in
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02040A] p-6 font-inter text-[#F8FAFC]">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-6xl space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs text-[#94A3B8] transition-colors hover:text-[#00F2FE]"
        >
          <ArrowLeft size={14} />
          Dashboard
        </Link>

        <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-[#00F2FE] to-[#0EA5E9] bg-clip-text text-2xl font-black tracking-tight text-transparent sm:text-3xl">
              Streamer Operational Hub
            </h1>
            <p className="mt-1 text-xs text-[#94A3B8]">
              Manage schedules, amen reactions, and Stripe payout setup.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handlePayoutOnboarding()}
            disabled={isOnboarding}
            className="rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#0EA5E9] px-5 py-2.5 text-xs font-bold text-[#02040A] shadow-[0_0_20px_rgba(0,242,254,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isOnboarding ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Syncing Financial Terminal…
              </span>
            ) : (
              '💼 Setup Stripe Payout Gateway'
            )}
          </button>
        </div>

        {scheduleNotice ? (
          <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#94A3B8]">
            {scheduleNotice}
          </p>
        ) : null}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#06111E]/60 p-6 shadow-xl backdrop-blur-md">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#00F2FE]">
                Live Session Metrics
              </span>
              <h2 className="mt-1 text-sm font-semibold text-[#CBD5E1]">
                Global &quot;Amen&quot; Interaction Echoes
              </h2>
            </div>
            <div className="my-4 flex items-baseline gap-2">
              <span className="font-mono text-5xl font-black tracking-tight text-white">
                {amenCount}
              </span>
              <span className="animate-pulse text-xs font-bold text-emerald-400">▲ Live Pulse</span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              Counts amen reactions on your stream room (
              <code className="text-[#00F2FE]">/stream/{userProfile.id.slice(0, 8)}…</code>).
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#06111E]/60 p-6 shadow-xl backdrop-blur-md md:col-span-2">
            <h3 className="mb-3 text-sm font-bold tracking-wide text-[#F8FAFC]">
              Schedule an Upcoming Live Gathering
            </h3>

            <form onSubmit={handleCreateSchedule} className="grid items-end gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#94A3B8]">
                  Broadcast Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Wednesday Night Bible Study"
                  className="w-full rounded-xl border border-slate-700 bg-[#02040A] px-3 py-2 text-xs text-white transition-colors focus:border-[#00F2FE] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[#94A3B8]">
                  Date &amp; Start Time
                </label>
                <input
                  type="datetime-local"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-[#02040A] px-3 py-2 text-xs text-white transition-colors focus:border-[#00F2FE] focus:outline-none [color-scheme:dark]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSavingSchedule}
                className="h-[34px] w-full rounded-xl bg-[#0EA5E9] px-4 py-2 text-xs font-bold text-[#02040A] shadow-md transition-colors hover:bg-cyan-400 disabled:opacity-50"
              >
                {isSavingSchedule ? 'Publishing…' : '🗓️ Publish Event Card'}
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#06111E]/40 p-6 shadow-xl">
          <h3 className="mb-4 text-sm font-bold text-[#F8FAFC]">Your Broadcast Calendar Agenda</h3>
          <div className="max-h-[350px] overflow-hidden overflow-y-auto rounded-xl border border-slate-800 bg-[#02040A] divide-y divide-slate-900">
            {schedule.length === 0 ? (
              <p className="p-6 text-center text-xs italic text-[#94A3B8]">
                No live gatherings are booked on your broadcast ledger yet.
              </p>
            ) : (
              schedule.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-[#06111E]/30"
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#F8FAFC]">{event.title}</h4>
                    <p className="mt-0.5 font-mono text-[10px] text-[#00F2FE]">
                      Starts: {new Date(event.scheduled_start).toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-800 bg-[#06111E] px-2.5 py-1 font-mono text-[10px] text-[#CBD5E1]">
                    ⏱️ {event.estimated_duration_mins} Min Session
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
