import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsContent } from "@/features/settings/components/SettingsContent";
import type { Plan } from "@/lib/stripe/plans";

export default async function SettingsPage() {
  const session = await auth();

  let currentPlan: Plan = "free";
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });
    currentPlan = (user?.plan ?? "free") as Plan;
  }

  return <SettingsContent currentPlan={currentPlan} />;
}
