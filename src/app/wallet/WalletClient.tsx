'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Wallet } from 'lucide-react';
import HubBackground from '@/components/HubBackground';
import { useAuth } from '@/hooks/useAuth';
import { isParableDevGuestClientEnabled } from '@/lib/parable-dev-guest';
import { createClient } from '@/utils/supabase/client';

interface LedgerEntry {
  id: string;
  amount_cents: number;
  coin_amount: number;
  source_type: string;
  description: string;
  created_at: string;
}

const COIN_PACKS = [
  { amount: 500, price: 500, label: '$5.00' },
  { amount: 1200, price: 1000, label: '$10.00' },
] as const;

export default function WalletClient() {
  const { userProfile, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [balanceCents, setBalanceCents] = useState(0);
  const [coinBalance, setCoinBalance] = useState(0);
  const [history, setHistory] = useState<LedgerEntry[]>([]);
  const [funding, setFunding] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutCanceled, setCheckoutCanceled] = useState(false);
  const [ledgerNotice, setLedgerNotice] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCheckoutSuccess(params.get('success') === 'true');
    setCheckoutCanceled(params.get('canceled') === 'true');
  }, []);

  useEffect(() => {
    if (!userProfile?.id) return;

    let cancelled = false;

    async function loadLedgerData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const ledgerUrl =
        session?.access_token || !isParableDevGuestClientEnabled()
          ? '/api/wallet/ledger'
          : `/api/wallet/ledger?userId=${encodeURIComponent(userProfile.id)}`;

      const res = await fetch(ledgerUrl, { credentials: 'same-origin', headers });
      const payload = (await res.json().catch(() => ({}))) as {
        entries?: LedgerEntry[];
        error?: string;
        notice?: string;
      };

      if (cancelled) return;

      if (!res.ok) {
        console.error('[wallet] Failed to load ledger:', payload.error ?? res.status);
        return;
      }

      const rows = payload.entries ?? [];
      setLedgerNotice(typeof payload.notice === 'string' ? payload.notice : null);
      setHistory(rows);
      setBalanceCents(rows.reduce((acc, curr) => acc + curr.amount_cents, 0));
      setCoinBalance(rows.reduce((acc, curr) => acc + (curr.coin_amount ?? 0), 0));
    }

    void loadLedgerData();
    return () => {
      cancelled = true;
    };
  }, [supabase, userProfile?.id]);

  const buyCoins = async (coins: number, cents: number) => {
    if (!userProfile?.id) {
      alert('Please sign in to purchase coin bundles.');
      return;
    }

    setFunding(String(coins));

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userEmail =
        session?.user?.email ??
        (typeof userProfile.email === 'string' ? userProfile.email : undefined);

      const res = await fetch('/api/checkout/coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coinAmount: coins,
          costCents: cents,
          userId: userProfile.id,
          userEmail,
        }),
      });

      const raw = await res.text();
      let data: { url?: string; error?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        data = { error: raw.trim() || `Checkout failed (HTTP ${res.status}).` };
      }

      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }

      alert(data.error || `Unable to start checkout (HTTP ${res.status}).`);
    } catch (err) {
      console.error('[wallet] Checkout network error:', err);
      alert('Network error during checkout. Please try again.');
    } finally {
      setFunding(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-[#050508] text-sm text-white/50">
        Loading wallet…
      </div>
    );
  }

  if (!userProfile?.id) {
    return (
      <div className="relative min-h-[60vh] bg-[#050508] text-white">
        <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
          <p className="text-sm text-white/60">Sign in to view your wallet and purchase coin bundles.</p>
          <Link
            href="/login"
            className="mt-6 rounded-xl bg-gradient-to-r from-[#00f2ff] to-blue-600 px-5 py-3 text-sm font-bold text-[#050508]"
          >
            Sign in
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-[60vh] bg-[#050508] text-white">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-35">
        <HubBackground />
      </div>
      <main className="relative z-10 mx-auto w-full min-w-0 max-w-5xl px-4 pb-16 pt-6">
        <Link
          href="/streamers"
          className="mb-8 inline-flex items-center gap-2 text-xs text-white/45 transition-colors hover:text-[#00f2ff]"
        >
          <ArrowLeft size={14} />
          Streamers hub
        </Link>

        <div className="mb-8 flex items-center gap-2 text-[#00f2ff]">
          <Wallet size={22} />
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Creator Wallet
          </h1>
        </div>

        {checkoutSuccess ? (
          <p className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Payment received — coins are added once Stripe confirms the checkout session.
          </p>
        ) : null}

        {checkoutCanceled ? (
          <p className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Checkout was canceled. You can buy coin bundles whenever you are ready.
          </p>
        ) : null}

        {ledgerNotice ? (
          <p className="mb-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/55">
            {ledgerNotice}
          </p>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-black/45 p-6 shadow-xl">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-white/45">
                Coin balance
              </p>
              <h2 className="mt-2 text-4xl font-black tabular-nums text-white">
                💎 {coinBalance.toLocaleString()}
              </h2>
              <p className="mt-3 text-sm text-white/50">
                Estimated USD valuation: ${(balanceCents / 100).toFixed(2)}
              </p>
            </div>
            <p className="mt-4 text-xs text-white/35">
              Ledger updates in real time after Stripe webhook confirmation.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/45 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white">Purchase platform coin bundles</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {COIN_PACKS.map((pack) => (
                <button
                  key={pack.amount}
                  type="button"
                  onClick={() => buyCoins(pack.amount, pack.price)}
                  disabled={funding !== null}
                  className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-[#050508] p-3 transition-all hover:border-[#00f2ff] hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="text-sm font-extrabold text-[#00f2ff]">💎 {pack.amount} Coins</span>
                  <span className="mt-1 text-xs text-white/45">Buy for {pack.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/45 p-6 shadow-xl">
          <h3 className="mb-4 text-lg font-bold text-white">Transactional ledger</h3>
          <div className="max-h-[300px] overflow-hidden overflow-y-auto rounded-xl border border-white/10 bg-[#050508]">
            {history.length === 0 ? (
              <p className="p-4 text-center text-sm italic text-white/45">
                No ledger entries yet. Purchase a coin bundle to get started.
              </p>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-white/5 p-4 text-sm transition-colors hover:bg-white/[0.02]"
                >
                  <div className="min-w-0 pr-4">
                    <span className="mr-2 rounded bg-white/10 px-2 py-0.5 text-xs font-bold uppercase text-white/70">
                      {item.source_type}
                    </span>
                    <span className="text-white/70">{item.description}</span>
                    {item.coin_amount ? (
                      <span className="ml-2 text-xs text-[#00f2ff]">+{item.coin_amount} coins</span>
                    ) : null}
                  </div>
                  <span
                    className={`shrink-0 font-mono font-bold tabular-nums ${
                      item.amount_cents >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {item.amount_cents >= 0 ? '+' : ''}${(item.amount_cents / 100).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
