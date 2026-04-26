"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, getPriceIdForPlan, isStripeConfigured } from "@/lib/stripe";
import type { ActionResult } from "@/lib/types/action-result";
import type { Plan } from "@/lib/stripe/plans";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";

export async function createCheckoutSessionAction(
  plan: "basic" | "premium",
): Promise<ActionResult<{ url: string }>> {
  try {
    if (!isStripeConfigured()) {
      return { success: false, error: "Stripe が設定されていません" };
    }

    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return { success: false, error: "認証が必要です" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true, plan: true },
    });

    if (user?.plan === plan) {
      return { success: false, error: "すでにこのプランです" };
    }

    const stripe = getStripe();

    let customerId = user?.stripeCustomerId ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const priceId = getPriceIdForPlan(plan);
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/settings/billing?success=true`,
      cancel_url: `${APP_URL}/settings/billing?canceled=true`,
      metadata: { userId: session.user.id, plan },
      subscription_data: {
        metadata: { userId: session.user.id, plan },
      },
    });

    if (!checkoutSession.url) {
      return { success: false, error: "チェックアウトセッションの作成に失敗しました" };
    }

    return { success: true, data: { url: checkoutSession.url } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "エラーが発生しました";
    return { success: false, error: msg };
  }
}

export async function createPortalSessionAction(): Promise<
  ActionResult<{ url: string }>
> {
  try {
    if (!isStripeConfigured()) {
      return { success: false, error: "Stripe が設定されていません" };
    }

    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return { success: false, error: "サブスクリプションが見つかりません" };
    }

    const stripe = getStripe();
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${APP_URL}/settings/billing`,
    });

    return { success: true, data: { url: portalSession.url } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "エラーが発生しました";
    return { success: false, error: msg };
  }
}

export async function getUserBillingDataAction(): Promise<
  ActionResult<{
    plan: Plan;
    stripeSubscriptionId: string | null;
    stripeCurrentPeriodEnd: Date | null;
  }>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        plan: true,
        stripeSubscriptionId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    return {
      success: true,
      data: {
        plan: (user?.plan ?? "free") as Plan,
        stripeSubscriptionId: user?.stripeSubscriptionId ?? null,
        stripeCurrentPeriodEnd: user?.stripeCurrentPeriodEnd ?? null,
      },
    };
  } catch {
    return { success: false, error: "データの取得に失敗しました" };
  }
}
