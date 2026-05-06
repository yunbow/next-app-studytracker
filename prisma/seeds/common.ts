import { PrismaClient } from "@prisma/client";

const BADGES = [
  {
    name: "First Step",
    description: "初めての学習セッションを記録した",
    icon: "🎯",
    condition: "学習セッションを1回記録する",
  },
  {
    name: "Week Warrior",
    description: "7日連続で学習した",
    icon: "🔥",
    condition: "7日間連続で学習セッションを記録する",
  },
  {
    name: "Century Club",
    description: "合計100時間の学習を達成した",
    icon: "💯",
    condition: "累計学習時間が100時間に達する",
  },
  {
    name: "Social Learner",
    description: "他のユーザーのセッションに5回コメントした",
    icon: "💬",
    condition: "他ユーザーのセッションに5回コメントする",
  },
  {
    name: "Goal Crusher",
    description: "目標を達成した",
    icon: "🏆",
    condition: "設定した目標のステータスを completed にする",
  },
];

export async function seedCommon(prisma: PrismaClient) {
  for (const badge of BADGES) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    });
  }
  console.log(`✓ badges seeded (${BADGES.length})`);
}
