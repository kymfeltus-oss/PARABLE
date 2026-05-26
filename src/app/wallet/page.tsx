'use client';

import dynamic from 'next/dynamic';

const WalletClient = dynamic(() => import('./WalletClient'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[40vh] items-center justify-center bg-[#050508] text-sm text-white/50">
      Loading wallet…
    </div>
  ),
});

export default function WalletPage() {
  return <WalletClient />;
}
