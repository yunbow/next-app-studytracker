"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/lib/types/action-result";
import {
  GetAdvancedAnalyticsSchema,
  GetEfficiencyScoreSchema,
  GetSubjectBalanceSchema,
  PredictGoalAchievementSchema,
  GenerateMonthlyReportSchema,
  type GetAdvancedAnalyticsInput,
  type GetEfficiencyScoreInput,
  type GetSubjectBalanceInput,
  type PredictGoalAchievementInput,
  type GenerateMonthlyReportInput,
} from "../schema/dashboard-schema";

/**
 * 高度な分析データを取得
 */
export async function getAdvancedAnalytics(
  input: GetAdvancedAnalyticsInput
): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = GetAdvancedAnalyticsSchema.parse(input);
    const targetUserId = validated.userId || session.user.id;

    const sessions = await prisma.studySession.findMany({
      where: {
        userId: targetUserId,
        startTime: {
          gte: new Date(validated.startDate),
          lte: new Date(validated.endDate),
        },
        endTime: { not: null },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        duration: true,
        subject: true,
      },
      orderBy: { startTime: "asc" },
    });

    // 学習効率スコア計算（セッション数 / 日数）
    const dayCount = Math.ceil(
      (new Date(validated.endDate).getTime() - new Date(validated.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const efficiencyScore = sessions.length / Math.max(dayCount, 1);

    // 最も生産的な時間帯
    const hourStats: Record<number, number> = {};
    sessions.forEach((s: { startTime: Date; duration: number | null }) => {
      const hour = s.startTime.getHours();
      hourStats[hour] = (hourStats[hour] || 0) + (s.duration || 0);
    });
    const mostProductiveHour = Object.entries(hourStats).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0];

    // 科目別集中度（平均セッション時間）
    const subjectFocus: Record<string, { totalTime: number; count: number }> = {};
    sessions.forEach((s: { subject: string | null; duration: number | null }) => {
      const subject = s.subject || "未分類";
      if (!subjectFocus[subject]) {
        subjectFocus[subject] = { totalTime: 0, count: 0 };
      }
      subjectFocus[subject].totalTime += s.duration || 0;
      subjectFocus[subject].count += 1;
    });

    const subjectFocusData = Object.entries(subjectFocus).map(([subject, data]) => ({
      subject,
      avgSessionMinutes: Math.floor(data.totalTime / data.count / 60),
      totalMinutes: Math.floor(data.totalTime / 60),
    }));

    // 週ごとの比較
    const weeklyData: Record<string, number> = {};
    sessions.forEach((s: { startTime: Date; duration: number | null }) => {
      const weekStart = new Date(s.startTime);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + (s.duration || 0);
    });

    const totalMinutes = sessions.reduce(
      (sum: number, s: { duration: number | null }) => sum + Math.floor((s.duration || 0) / 60),
      0
    );

    logger.info({ userId: targetUserId }, "Advanced analytics retrieved");

    return {
      success: true,
      data: {
        totalMinutes,
        totalHours: Math.floor(totalMinutes / 60),
        sessionCount: sessions.length,
        efficiencyScore: Math.round(efficiencyScore * 100) / 100,
        mostProductiveHour: mostProductiveHour ? parseInt(mostProductiveHour) : null,
        subjectFocus: subjectFocusData,
        weeklyComparison: Object.entries(weeklyData).map(([week, minutes]) => ({
          week,
          minutes: Math.floor(minutes / 60),
        })),
      },
    };
  } catch (error) {
    logger.error({ error }, "Failed to get advanced analytics");
    return { success: false, error: "高度な分析データの取得に失敗しました" };
  }
}

/**
 * 学習効率スコアを取得
 */
export async function getEfficiencyScore(
  input: GetEfficiencyScoreInput
): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = GetEfficiencyScoreSchema.parse(input);
    const targetUserId = validated.userId || session.user.id;

    const now = new Date();
    let startDate = new Date();
    if (validated.period === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (validated.period === "month") {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const sessions = await prisma.studySession.findMany({
      where: {
        userId: targetUserId,
        startTime: { gte: startDate },
        endTime: { not: null },
      },
    });

    const totalMinutes = sessions.reduce(
      (sum: number, s: { duration: number | null }) => sum + Math.floor((s.duration || 0) / 60),
      0
    );
    const avgSessionMinutes =
      sessions.length > 0 ? totalMinutes / sessions.length : 0;

    // スコア計算（0-100）
    const score = Math.min(
      100,
      Math.round((sessions.length * 2 + avgSessionMinutes) / 2)
    );

    return {
      success: true,
      data: {
        score,
        totalMinutes,
        sessionCount: sessions.length,
        avgSessionMinutes: Math.round(avgSessionMinutes),
      },
    };
  } catch (error) {
    logger.error({ error }, "Failed to get efficiency score");
    return { success: false, error: "効率スコアの取得に失敗しました" };
  }
}

/**
 * 科目バランス分析を取得
 */
export async function getSubjectBalance(
  input: GetSubjectBalanceInput
): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = GetSubjectBalanceSchema.parse(input);
    const targetUserId = validated.userId || session.user.id;

    const now = new Date();
    let startDate = new Date();
    if (validated.period === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (validated.period === "month") {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const sessions = await prisma.studySession.findMany({
      where: {
        userId: targetUserId,
        startTime: { gte: startDate },
        endTime: { not: null },
      },
      select: { subject: true, duration: true },
    });

    const subjectStats: Record<string, number> = {};
    let totalMinutes = 0;

    sessions.forEach((s: { subject: string | null; duration: number | null }) => {
      const subject = s.subject || "未分類";
      const minutes = Math.floor((s.duration || 0) / 60);
      subjectStats[subject] = (subjectStats[subject] || 0) + minutes;
      totalMinutes += minutes;
    });

    const balanceData = Object.entries(subjectStats).map(([subject, minutes]) => ({
      subject,
      minutes,
      percentage: totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0,
    }));

    // バランススコア（均等度）
    const idealPercentage = 100 / Math.max(balanceData.length, 1);
    const variance = balanceData.reduce(
      (sum, item) => sum + Math.abs(item.percentage - idealPercentage),
      0
    );
    const balanceScore = Math.max(0, 100 - variance / 2);

    return {
      success: true,
      data: {
        subjects: balanceData,
        balanceScore: Math.round(balanceScore),
        totalMinutes,
      },
    };
  } catch (error) {
    logger.error({ error }, "Failed to get subject balance");
    return { success: false, error: "科目バランスの取得に失敗しました" };
  }
}

/**
 * 目標達成予測を取得
 */
export async function predictGoalAchievement(
  input: PredictGoalAchievementInput
): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = PredictGoalAchievementSchema.parse(input);

    const goal = await prisma.goal.findUnique({
      where: { id: validated.goalId },
      include: {
        studySessions: {
          where: { endTime: { not: null } },
        },
      },
    });

    if (!goal) {
      return { success: false, error: "目標が見つかりません" };
    }

    if (goal.userId !== session.user.id) {
      return { success: false, error: "この目標を閲覧する権限がありません" };
    }

    const totalMinutes = goal.studySessions.reduce(
      (sum: number, s: { duration: number | null }) => sum + Math.floor((s.duration || 0) / 60),
      0
    );
    const currentHours = Math.floor(totalMinutes / 60);
    const targetHours = goal.targetHours || 0;
    const remainingHours = Math.max(0, targetHours - currentHours);

    // 達成率
    const achievementRate =
      targetHours > 0 ? Math.round((currentHours / targetHours) * 100) : 0;

    // 予測計算
    let prediction = "データ不足";
    let estimatedDays = null;

    if (goal.studySessions.length >= 3) {
      const recentSessions = goal.studySessions.slice(-7);
      const avgDailyMinutes =
        recentSessions.reduce((sum: number, s: { duration: number | null }) => sum + (s.duration || 0), 0) /
        7 /
        60;

      if (avgDailyMinutes > 0) {
        estimatedDays = Math.ceil((remainingHours * 60) / avgDailyMinutes);
        if (achievementRate >= 100) {
          prediction = "達成済み";
        } else if (estimatedDays <= 7) {
          prediction = "順調";
        } else if (estimatedDays <= 30) {
          prediction = "やや遅れ";
        } else {
          prediction = "要改善";
        }
      }
    }

    return {
      success: true,
      data: {
        currentHours,
        targetHours,
        remainingHours,
        achievementRate,
        prediction,
        estimatedDays,
      },
    };
  } catch (error) {
    logger.error({ error }, "Failed to predict goal achievement");
    return { success: false, error: "目標達成予測の取得に失敗しました" };
  }
}

/**
 * 月次レポートを生成
 */
export async function generateMonthlyReport(
  input: GenerateMonthlyReportInput
): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = GenerateMonthlyReportSchema.parse(input);
    const targetUserId = validated.userId || session.user.id;

    const startDate = new Date(validated.year, validated.month - 1, 1);
    const endDate = new Date(validated.year, validated.month, 0, 23, 59, 59);

    const sessions = await prisma.studySession.findMany({
      where: {
        userId: targetUserId,
        startTime: { gte: startDate, lte: endDate },
        endTime: { not: null },
      },
      orderBy: { startTime: "asc" },
    });

    const totalMinutes = sessions.reduce(
      (sum: number, s: { duration: number | null }) => sum + Math.floor((s.duration || 0) / 60),
      0
    );

    // 日別データ
    const dailyData: Record<string, number> = {};
    sessions.forEach((s: { startTime: Date; duration: number | null }) => {
      const date = s.startTime.toISOString().split("T")[0];
      dailyData[date] = (dailyData[date] || 0) + (s.duration || 0);
    });

    // 学習日数
    const studyDays = Object.keys(dailyData).length;

    // 科目別データ
    const subjectData: Record<string, number> = {};
    sessions.forEach((s: { subject: string | null; duration: number | null }) => {
      const subject = s.subject || "未分類";
      subjectData[subject] = (subjectData[subject] || 0) + (s.duration || 0);
    });

    // 最長セッション
    const longestSession = sessions.reduce(
      (max: number, s: { duration: number | null }) => (s.duration || 0) > max ? s.duration || 0 : max,
      0
    );

    logger.info(
      { userId: targetUserId, year: validated.year, month: validated.month },
      "Monthly report generated"
    );

    return {
      success: true,
      data: {
        year: validated.year,
        month: validated.month,
        totalHours: Math.floor(totalMinutes / 60),
        totalMinutes,
        sessionCount: sessions.length,
        studyDays,
        avgDailyMinutes: studyDays > 0 ? Math.floor(totalMinutes / studyDays) : 0,
        longestSessionMinutes: Math.floor(longestSession / 60),
        subjects: Object.entries(subjectData).map(([subject, duration]) => ({
          subject,
          minutes: Math.floor(duration / 60),
        })),
        dailyData: Object.entries(dailyData).map(([date, duration]) => ({
          date,
          minutes: Math.floor(duration / 60),
        })),
      },
    };
  } catch (error) {
    logger.error({ error }, "Failed to generate monthly report");
    return { success: false, error: "月次レポートの生成に失敗しました" };
  }
}
