export function resolveStripeSecretKey(): string | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  if (key.includes('your_secret_key') || key.endsWith('_here')) return null;
  if (!/^sk_(test|live)_/.test(key)) return null;
  return key;
}

export function getStripeConfigError(): string | null {
  if (resolveStripeSecretKey()) return null;
  return 'Stripe is not configured. Set STRIPE_SECRET_KEY (sk_test_...) in .env.local, then restart npm run dev.';
}

export function formatStripePriceId(priceId: string): string | null {
  const trimmed = priceId.trim();
  if (!trimmed.startsWith('price_')) return null;
  return trimmed;
}
