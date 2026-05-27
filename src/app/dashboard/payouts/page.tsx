'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Banknote, Loader2 } from 'lucide-react';
import HubBackground from '@/components/HubBackground';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/utils/supabase/client';

export default function DashboardPayoutsPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [connecting, setConnecting] = useState(false);
  const [onboardSuccess, setOnboardSuccess] = useState(false);
  const [onboardRefresh, setOnboardRefresh] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOnboardSuccess(params.get('success') === 'true');
    setOnboardRefresh(params.get('refresh') === 'true');
  }, []);

  const startConnectOnboarding = async () => {
    if (!userProfile?.id) {
      alert('Please sign in to set up payouts.');
      return;
    }

    setConnecting(true);
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
        body: JSON.stringify({
          userId: userProfile.id,
          userEmail,
        }),
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

      alert(data.error || `Unable to start Stripe Connect onboarding (HTTP ${res.status}).`);
    } catch (err) {
      console.error('[payouts] Connect onboarding error:', err);
      alert('Network error during payout setup. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-[#050508] text-sm text-white/50">
        Loading payouts…
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#050508] text-white">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-35">
        <HubBackground />
      </div>
      <main className="relative z-10 mx-auto max-w-lg px-4 pb-16 pt-6">
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-xs text-white/45 transition-colors hover:text-[#00f2ff]"
        >
          <ArrowLeft size={14} />
          Dashboard
        </Link>

        <div className="mb-6 flex items-center gap-2 text-[#00f2ff]">
          <Banknote size={22} />
          <h1 className="text-2xl font-extrabold text-white">Creator Payouts</h1>
        </div>

        {onboardSuccess ? (
          <p className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Stripe Connect onboarding completed. Payout details are saved to your profile.
          </p>
        ) : null}

        {onboardRefresh ? (
          <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Onboarding session expired or was interrupted. You can restart setup below.
          </p>
        ) : null}

        <div className="rounded-2xl border border-white/10 bg-black/45 p-6 shadow-xl">
          <p className="text-sm text-white/60">
            Link a bank account or debit card through Stripe Express to receive creator earnings
            and payout transfers.
          </p>
          <button
            type="button"
            onClick={() => void startConnectOnboarding()}
            disabled={connecting || !userProfile?.id}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00f2ff] to-blue-600 px-4 py-3 text-sm font-bold text-[#050508] transition-all hover:from-cyan-300 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {connecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening Stripe onboarding…
              </>
            ) : (
              'Set up payout account'
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
