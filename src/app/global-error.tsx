'use client';

import { useEffect } from "react";

import { logProductionError } from "@/lib/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void logProductionError(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-white/60">
            {error.message || 'An unexpected error occurred while loading this page.'}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg bg-[#00f2ff] px-4 py-2 text-sm font-semibold text-black"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
