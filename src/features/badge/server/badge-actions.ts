"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/lib/types/action-result";
import { revalidatePath } from "next/cache";
import {
  CreateBadgeSchema,
  type CreateBadgeInput,
} from "../schema/badge-schema";

/**
 * バッジを作成（管理者のみ）
 */
export async function createBadge(
  input: CreateBadgeInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return { success: false, error: "管理者権限が必要です" };
    }

    const validated = CreateBadgeSchema.parse(input);

    const badge = await prisma.badge.create({
      data: validated,
    });

    logger.info({ badgeId: badge.id, userId: session.user.id }, "Badge created");
    revalidatePath("/admin/badges");

    return { success: true, data: { id: badge.id } };
  } catch (error) {
    logger.error({ error }, "Failed to create badge");
    return { success: false, error: "バッジの作成に失敗しました" };
  }
}

/**
 * ユーザーのバッジ達成状況をチェックして自動付与
 */
export async function checkAndAwardBadges(
  userId: string
): Promise<ActionResult<string[]>> {
  try {
    const awardedBadges: string[] = [];

    // 1時間達成バッジ
    const totalMinutes = await prisma.studySession.aggregate({
      where: {
        userId,
        endTime: { not: null },
      },
      _sum: { duration: true },
    });

    const totalHours = Math.floor((totalMinutes._sum.duration || 0) / 3600);

    if (totalHours >= 1) {
      const badge = await prisma.badge.findUnique({
        where: { name: "1時間達成" },
      });

      if (badge) {
        const existing = await prisma.userBadge.findUnique({
          where: {
            userId_badgeId: {
              userId,
              badgeId: badge.id,
            },
          },
        });

        if (!existing) {
          await prisma.userBadge.create({
            data: {
              userId,
              badgeId: badge.id,
            },
          });
          awardedBadges.push(badge.name);

          // 通知を作成
          await prisma.notification.create({
            data: {
              type: "badge_earned",
              recipientId: userId,
              actorId: userId,
            },
          });
        }
      }
    }

    // 5日連続達成バッジ
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const recentSessions = await prisma.studySession.findMany({
      where: {
        userId,
        startTime: { gte: fiveDaysAgo },
        endTime: { not: null },
      },
      select: { startTime: true },
    });

    const studyDates = new Set(
      recentSessions.map((s: { startTime: Date }) => s.startTime.toISOString().split("T")[0])
    );

    let consecutiveDays = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 5; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];

      if (studyDates.has(dateStr)) {
        consecutiveDays++;
      } else if (i > 0) {
        break;
      }
    }

    if (consecutiveDays >= 5) {
      const badge = await prisma.badge.findUnique({
        where: { name: "5日連続達成" },
      });

      if (badge) {
        const existing = await prisma.userBadge.findUnique({
          where: {
            userId_badgeId: {
              userId,
              badgeId: badge.id,
            },
          },
        });

        if (!existing) {
          await prisma.userBadge.create({
            data: {
              userId,
              badgeId: badge.id,
            },
          });
          awardedBadges.push(badge.name);

          await prisma.notification.create({
            data: {
              type: "badge_earned",
              recipientId: userId,
              actorId: userId,
            },
          });
        }
      }
    }

    // 月30時間突破バッジ
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyMinutes = await prisma.studySession.aggregate({
      where: {
        userId,
        startTime: { gte: thirtyDaysAgo },
        endTime: { not: null },
      },
      _sum: { duration: true },
    });

    const monthlyHours = Math.floor((monthlyMinutes._sum.duration || 0) / 3600);

    if (monthlyHours >= 30) {
      const badge = await prisma.badge.findUnique({
        where: { name: "月30時間突破" },
      });

      if (badge) {
        const existing = await prisma.userBadge.findUnique({
          where: {
            userId_badgeId: {
              userId,
              badgeId: badge.id,
            },
          },
        });

        if (!existing) {
          await prisma.userBadge.create({
            data: {
              userId,
              badgeId: badge.id,
            },
          });
          awardedBadges.push(badge.name);

          await prisma.notification.create({
            data: {
              type: "badge_earned",
              recipientId: userId,
              actorId: userId,
            },
          });
        }
      }
    }

    if (awardedBadges.length > 0) {
      logger.info({ userId, badges: awardedBadges }, "Badges awarded");
      revalidatePath("/profile");
    }

    return { success: true, data: awardedBadges };
  } catch (error) {
    logger.error({ error, userId }, "Failed to check and award badges");
    return { success: false, error: "バッジチェックに失敗しました" };
  }
}

/**
 * ユーザーのバッジ一覧を取得
 */
export async function getUserBadges(
  userId?: string
): Promise<ActionResult<unknown>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const targetUserId = userId || session.user.id;

    const userBadges = await prisma.userBadge.findMany({
      where: { userId: targetUserId },
      include: {
        badge: true,
      },
      orderBy: { earnedAt: "desc" },
    });

    return { success: true, data: userBadges };
  } catch (error) {
    logger.error({ error }, "Failed to get user badges");
    return { success: false, error: "バッジの取得に失敗しました" };
  }
}

/**
 * 初期バッジを作成（セットアップ用）
 */
export async function seedBadges(): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return { success: false, error: "管理者権限が必要です" };
    }

    const badges = [
      {
        name: "1時間達成",
        description: "累計1時間の学習を達成しました",
        icon: "⏰",
        condition: "累計学習時間が1時間以上",
      },
      {
        name: "5日連続達成",
        description: "5日連続で学習しました",
        icon: "🔥",
        condition: "5日連続で学習セッションを記録",
      },
      {
        name: "月30時間突破",
        description: "1ヶ月で30時間以上学習しました",
        icon: "🏆",
        condition: "過去30日間の学習時間が30時間以上",
      },
    ];

    for (const badge of badges) {
      await prisma.badge.upsert({
        where: { name: badge.name },
        update: badge,
        create: badge,
      });
    }

    logger.info({ userId: session.user.id }, "Badges seeded");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to seed badges");
    return { success: false, error: "バッジの初期化に失敗しました" };
  }
}
