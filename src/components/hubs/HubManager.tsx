'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { defaultHubForUser, getUnlockedHubIds } from '@/lib/hub-permissions';
import { HUB_DEFINITIONS, type HubId } from '@/lib/hub-registry';
import HubModulePanel from '@/components/hubs/HubModulePanel';
import HubRolodex from '@/components/hubs/HubRolodex';
import GrowthMapPanel from '@/components/hubs/GrowthMapPanel';

const HubEnvironmentCanvas = dynamic(() => import('@/components/hubs/HubEnvironmentCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-52 w-full items-center justify-center rounded-2xl border border-white/10 bg-black/80 text-[10px] font-black uppercase tracking-widest text-white/35">
      Loading 3D hub…
    </div>
  ),
});

export default function HubManager() {
  const { userProfile, loading } = useAuth();
  const unlocked = useMemo(() => getUnlockedHubIds(userProfile), [userProfile]);
  const [active, setActive] = useState<HubId>('sanctuary');

  useEffect(() => {
    if (loading) return;
    const next = defaultHubForUser(unlocked, userProfile);
    setActive((prev) => (unlocked.includes(prev) ? prev : next));
  }, [loading, unlocked, userProfile]);

  useEffect(() => {
    if (!unlocked.includes(active)) {
      setActive(unlocked[0] ?? 'sanctuary');
    }
  }, [unlocked, active]);

  const accent = HUB_DEFINITIONS[active].accent;

  return (
    <div className="relative space-y-6">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-40 transition-colors duration-500"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% -10%, ${accent}33, transparent 55%)`,
        }}
      />

      <motion.div
        key={active}
        initial={{ opacity: 0.35, filter: 'blur(14px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative h-52 w-full sm:h-60"
      >
        <HubEnvironmentCanvas hubId={active} />
      </motion.div>

      <HubRolodex unlocked={unlocked} activeId={active} onSelect={setActive} />

      <div className="grid gap-6 lg:grid-cols-2">
        <HubModulePanel hubId={active} />
        <GrowthMapPanel userId={userProfile?.id} />
      </div>

      {!loading && !userProfile && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center text-[11px] text-amber-100/90">
          Sign in to sync hub unlocks from your profile. You&apos;re seeing progression demos from local Kingdom XP only.
        </p>
      )}
    </div>
  );
}
