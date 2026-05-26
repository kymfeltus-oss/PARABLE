'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Crown } from 'lucide-react';
import HubBackground from '@/components/HubBackground';
import { useAuth } from '@/hooks/useAuth';
import type { SubscriptionTier } from '@/types/monetization';
import { createClient } from '@/utils/supabase/client';

function normalizeTier(row: Record<string, unknown>): SubscriptionTier {
  const perksRaw = row.perks;
  const perks =
    perksRaw && typeof perksRaw === 'object' && !Array.isArray(perksRaw)
      ? (perksRaw as SubscriptionTier['perks'])
      : { badge: '✨', color: '#00f2ff', chat_highlight: false };

  return {
    id: String(row.id),
    name: String(row.name ?? 'Tier'),
    stripe_price_id: String(row.stripe_price_id ?? ''),
    cost_cents: Number(row.cost_cents ?? 0),
    perks: {
      badge: perks.badge ?? '✨',
      color: perks.color ?? '#00f2ff',
      chat_highlight: Boolean(perks.chat_highlight),
    },
  };
}

export default function ContributionTiersClient() {
  const { userProfile } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [dbTiers, setDbTiers] = useState<SubscriptionTier[]>([]);
  const [loadingTiers, setLoadingTiers] = useState(true);
  const [loadingTierId, setLoadingTierId] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutCanceled, setCheckoutCanceled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCheckoutSuccess(params.get('success') === 'true');
    setCheckoutCanceled(params.get('canceled') === 'true');
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadActiveTiers() {
      setLoadingTiers(true);
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('cost_cents', { ascending: true });

      if (cancelled) return;

      if (!error && data) {
        setDbTiers(data.map((row) => normalizeTier(row as Record<string, unknown>)));
      } else if (error) {
        console.error('[contribution-tiers] Failed to load tiers:', error);
      }
      setLoadingTiers(false);
    }

    void loadActiveTiers();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const handleTierCheckout = async (priceId: string, tierId: string) => {
    if (!userProfile?.id) {
      alert('Please sign in to select a platform tier.');
      return;
    }

    if (!priceId) {
      alert('This tier is not configured for checkout yet.');
      return;
    }

    setLoadingTierId(tierId);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userEmail =
        session?.user?.email ??
        (typeof userProfile.email === 'string' ? userProfile.email : undefined);

      const res = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: userProfile.id,
          userEmail,
        }),
      });

      const raw = await res.text();
      let data: { url?: string; error?: string; sessionId?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        data = { error: raw.trim() || `Checkout failed (HTTP ${res.status}).` };
      }

      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }

      const message =
        data.error ||
        (data.sessionId && !data.url
          ? 'Stripe session was created but no checkout URL was returned.'
          : '') ||
        `Unable to start checkout (HTTP ${res.status}). Check STRIPE_SECRET_KEY and tier Price IDs in .env.local / Supabase.`;

      console.error('[contribution-tiers] Checkout session failed:', {
        status: res.status,
        message,
        body: data,
      });
      alert(message);
      setLoadingTierId(null);
    } catch (err) {
      console.error('[contribution-tiers] Checkout network error:', err);
      alert('Network error during checkout. Please try again.');
      setLoadingTierId(null);
    }
  };

  return (
    <div className="relative min-h-[60vh] bg-[#050508] text-white">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-35">
        <HubBackground />
      </div>
      <main className="relative z-10 mx-auto w-full min-w-0 max-w-full px-4 pb-16 pt-6">
        <Link
          href="/streamers"
          className="mb-8 inline-flex items-center gap-2 text-xs text-white/45 transition-colors hover:text-[#00f2ff]"
        >
          <ArrowLeft size={14} />
          Streamers hub
        </Link>

        <div className="mx-auto my-4 max-w-4xl text-center">
          <div className="flex items-center justify-center gap-2 text-[#00f2ff]">
            <Crown size={22} />
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Support the PARABLE Community
            </h1>
          </div>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/50">
            Choose a platform level to unlock custom rewards and connect across generations.
          </p>
        </div>

        {checkoutSuccess ? (
          <p className="mx-auto mb-6 max-w-5xl rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Thank you — your subscription is processing. Perks appear once Stripe confirms payment.
          </p>
        ) : null}

        {checkoutCanceled ? (
          <p className="mx-auto mb-6 max-w-5xl rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Checkout was canceled. You can pick a tier whenever you are ready.
          </p>
        ) : null}

        {loadingTiers ? (
          <p className="mt-10 text-center text-sm text-white/45">Loading tiers…</p>
        ) : dbTiers.length === 0 ? (
          <p className="mt-10 text-center text-sm text-white/45">
            No tiers are available yet. Seed <code className="text-[#00f2ff]">subscription_tiers</code> in Supabase to enable checkout.
          </p>
        ) : (
          <div className="mx-auto grid max-w-5xl gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {dbTiers.map((tier) => (
              <div
                key={tier.id}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-black/45 p-6 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold text-white">{tier.name}</h2>
                    <span className="text-2xl" aria-hidden>
                      {tier.perks.badge}
                    </span>
                  </div>
                  <p className="mt-4 text-3xl font-black tabular-nums text-white">
                    ${(tier.cost_cents / 100).toFixed(2)}
                    <span className="text-xs font-normal text-white/45"> / month</span>
                  </p>

                  <ul className="mt-6 space-y-3 border-t border-white/10 pt-4 text-sm text-white/70">
                    <li className="flex items-center gap-2">✨ Exclusive name badge</li>
                    <li className="flex items-center gap-2" style={{ color: tier.perks.color }}>
                      🎨 Custom profile colors
                    </li>
                    {tier.perks.chat_highlight ? (
                      <li className="flex items-center gap-2 text-[#00f2ff]">🔥 Highlighted chat power</li>
                    ) : null}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleTierCheckout(tier.stripe_price_id, tier.id)}
                  disabled={loadingTierId !== null}
                  className="mt-8 w-full rounded-xl bg-gradient-to-r from-[#00f2ff] to-blue-600 px-4 py-3 text-center text-sm font-bold text-[#050508] transition-all hover:from-cyan-300 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingTierId === tier.id ? 'Connecting securely…' : 'Select level'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
