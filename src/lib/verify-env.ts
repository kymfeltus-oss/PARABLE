const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "LIVEKIT_API_KEY",
  "LIVEKIT_API_SECRET",
  "LIVEKIT_URL",
  "NEXT_PUBLIC_APP_URL",
  "CRON_SECRET_KEY",
] as const;

/** Client bundles need a public WSS host; warn if missing (fallback exists in code). */
const recommendedEnvVars = ["NEXT_PUBLIC_LIVEKIT_URL"] as const;

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.includes("_goes_here")) return true;
  if (trimmed.includes("your_private")) return true;
  if (trimmed.includes("your_secret_key")) return true;
  return false;
}

/** Validates production application environmental variables configuration blocks. */
export function verifyProductionEnvironment(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const variable of requiredEnvVars) {
    if (isPlaceholder(process.env[variable])) {
      missing.push(variable);
    }
  }

  const recommended: string[] = [];
  for (const variable of recommendedEnvVars) {
    if (isPlaceholder(process.env[variable])) {
      recommended.push(variable);
    }
  }

  if (missing.length > 0) {
    console.error(
      `[CRITICAL DEPLOYMENT FAILURE] Missing vital environmental parameters:\n`,
      missing,
    );
  }

  if (recommended.length > 0) {
    console.warn(
      `[DEPLOYMENT WARNING] Recommended LiveKit client URL missing (set to same value as LIVEKIT_URL):\n`,
      recommended,
    );
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}
