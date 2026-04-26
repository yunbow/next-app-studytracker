import "server-only";
import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");

    const mockHost = process.env.STRIPE_MOCK_HOST;
    _stripe = new Stripe(key, {
      apiVersion: "2026-02-25.clover",
      ...(mockHost ? { host: mockHost, port: 12111, protocol: "http" } : {}),
    });
  }
  return _stripe;
}

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET &&
      process.env.STRIPE_BASIC_PRICE_ID &&
      process.env.STRIPE_PREMIUM_PRICE_ID,
  );
}

export function getPriceIdForPlan(plan: "basic" | "premium"): string {
  const id =
    plan === "basic"
      ? process.env.STRIPE_BASIC_PRICE_ID
      : process.env.STRIPE_PREMIUM_PRICE_ID;
  if (!id) throw new Error(`Price ID for plan "${plan}" is not configured`);
  return id;
}
