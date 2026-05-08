import "server-only";
import { prisma } from "@/lib/prisma";

const PLAN_LEVEL: Record<string, number> = { free: 0, basic: 1, premium: 2 };

type GateResult = { allowed: true } | { allowed: false; error: string };

export async function checkPlanGate(
  userId: string,
  required: "basic" | "premium",
): Promise<GateResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  const level = PLAN_LEVEL[user?.plan ?? "free"] ?? 0;
  if (level >= PLAN_LEVEL[required]) return { allowed: true };
  const name = required === "basic" ? "Basic" : "Premium";
  return {
    allowed: false,
    error: `この機能は ${name} プラン以上で利用できます。設定 → サブスクリプションからアップグレードしてください。`,
  };
}

export async function checkGoalLimit(userId: string): Promise<GateResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  if ((user?.plan ?? "free") !== "free") return { allowed: true };

  const count = await prisma.goal.count({
    where: { userId, status: "active" },
  });
  if (count >= 3) {
    return {
      allowed: false,
      error:
        "Free プランでは有効な目標を同時に3件まで作成できます。Basic 以上にアップグレードすると無制限になります。",
    };
  }
  return { allowed: true };
}
