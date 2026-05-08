import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BillingContent } from "@/features/billing/components/BillingContent";
import type { Plan } from "@/lib/stripe/plans";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
    },
  });

  return (
    <BillingContent
      currentPlan={(user?.plan ?? "free") as Plan}
      stripeSubscriptionId={user?.stripeSubscriptionId ?? null}
      stripeCurrentPeriodEnd={user?.stripeCurrentPeriodEnd ?? null}
    />
  );
}
