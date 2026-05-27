type StripeKeyValidation =
  | { ok: true; key: string }
  | { ok: false; reason: "missing" | "placeholder" | "invalid_format" };

function validateStripeSecretKey(): StripeKeyValidation {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return { ok: false, reason: "missing" };
  if (key.includes("your_secret_key") || key.endsWith("_here")) {
    return { ok: false, reason: "placeholder" };
  }
  if (!/^sk_(test|live)_/.test(key)) return { ok: false, reason: "invalid_format" };
  return { ok: true, key };
}

export function resolveStripeSecretKey(): string | null {
  const result = validateStripeSecretKey();
  return result.ok ? result.key : null;
}

export function getStripeConfigFailureReason():
  | "missing"
  | "placeholder"
  | "invalid_format"
  | null {
  const result = validateStripeSecretKey();
  return result.ok ? null : result.reason;
}

export function getStripeConfigError(): string | null {
  const reason = getStripeConfigFailureReason();
  if (!reason) return null;

  if (reason === "placeholder") {
    return "Stripe is not configured. Replace the placeholder STRIPE_SECRET_KEY in .env.local with your real sk_test_ key from Stripe Dashboard → Developers → API keys, then restart npm run dev.";
  }
  if (reason === "invalid_format") {
    return "Stripe is not configured. STRIPE_SECRET_KEY must start with sk_test_ or sk_live_. Update .env.local and restart npm run dev.";
  }
  return "Stripe is not configured. Set STRIPE_SECRET_KEY (sk_test_...) in .env.local, then restart npm run dev.";
}

export function formatStripePriceId(priceId: string): string | null {
  const trimmed = priceId.trim();
  if (!trimmed.startsWith('price_')) return null;
  return trimmed;
}
