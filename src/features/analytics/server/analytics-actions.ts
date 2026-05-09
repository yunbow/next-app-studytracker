"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/lib/types/action-result";
import {
  AnalyticsPeriodSchema,
  SubjectAnalyticsSchema,
  type AnalyticsPeriodInput,
  type SubjectAnalyticsInput,
} from "../schema/analytics-schema";

type DailyStat = { date: string; totalMinutes: number; sessionCount: number };
type SubjectStat = { subject: string; totalMinutes: number; sessionCount: number };
type TimeOfDayStat = { period: string; totalMinutes: number; sessionCount: number };

type AnalyticsByPeriodResult = {
  totalMinutes: number;
  totalHours: number;
  sessionCount: number;
  dailyStats: DailyStat[];
  subjectStats: SubjectStat[];
  timeOfDayStats: TimeOfDayStat[];
};

/**
 * 期間別統計を取得
 */
export async function getAnalyticsByPeriod(
  input: AnalyticsPeriodInput
): Promise<ActionResult<AnalyticsByPeriodResult>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = AnalyticsPeriodSchema.parse(input);

    const sessions = await prisma.studySession.findMany({
      where: {
        userId: session.user.id,
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

    // 日別集計
    const dailyStats = sessions.reduce<Record<string, DailyStat>>((acc, session) => {
      const date = session.startTime.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { date, totalMinutes: 0, sessionCount: 0 };
      }
      acc[date].totalMinutes += Math.floor((session.duration || 0) / 60);
      acc[date].sessionCount += 1;
      return acc;
    }, {});

    // 科目別集計
    const subjectStats = sessions.reduce<Record<string, SubjectStat>>((acc, session) => {
      const subject = session.subject || "未分類";
      if (!acc[subject]) {
        acc[subject] = { subject, totalMinutes: 0, sessionCount: 0 };
      }
      acc[subject].totalMinutes += Math.floor((session.duration || 0) / 60);
      acc[subject].sessionCount += 1;
      return acc;
    }, {});

    // 時間帯別集計
    const timeOfDayStats = sessions.reduce<Record<string, TimeOfDayStat>>((acc, session) => {
      const hour = session.startTime.getHours();
      let period = "夜";
      if (hour >= 6 && hour < 12) period = "朝";
      else if (hour >= 12 && hour < 18) period = "昼";

      if (!acc[period]) {
        acc[period] = { period, totalMinutes: 0, sessionCount: 0 };
      }
      acc[period].totalMinutes += Math.floor((session.duration || 0) / 60);
      acc[period].sessionCount += 1;
      return acc;
    }, {});

    const totalMinutes = sessions.reduce(
      (sum, s) => sum + Math.floor((s.duration || 0) / 60),
      0
    );

    logger.info(
      { userId: session.user.id, period: `${validated.startDate} - ${validated.endDate}` },
      "Analytics retrieved"
    );

    return {
      success: true,
      data: {
        totalMinutes,
        totalHours: Math.floor(totalMinutes / 60),
        sessionCount: sessions.length,
        dailyStats: Object.values(dailyStats),
        subjectStats: Object.values(subjectStats),
        timeOfDayStats: Object.values(timeOfDayStats),
      },
    };
  } catch (error) {
    logger.error({ error }, "Failed to get analytics");
    return { success: false, error: "統計の取得に失敗しました" };
  }
}

/**
 * 科目別統計を取得
 */
export async function getSubjectAnalytics(
  input: SubjectAnalyticsInput
): Promise<ActionResult<SubjectStat[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = SubjectAnalyticsSchema.parse(input);

    // 期間を計算
    const now = new Date();
    const startDate = new Date();
    if (validated.period === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (validated.period === "month") {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const sessions = await prisma.studySession.findMany({
      where: {
        userId: session.user.id,
        startTime: { gte: startDate },
        endTime: { not: null },
      },
      select: {
        subject: true,
        duration: true,
      },
    });

    const subjectStats = sessions.reduce<Record<string, SubjectStat>>((acc, session) => {
      const subject = session.subject || "未分類";
      if (!acc[subject]) {
        acc[subject] = { subject, totalMinutes: 0, sessionCount: 0 };
      }
      acc[subject].totalMinutes += Math.floor((session.duration || 0) / 60);
      acc[subject].sessionCount += 1;
      return acc;
    }, {});

    return {
      success: true,
      data: Object.values(subjectStats),
    };
  } catch (error) {
    logger.error({ error }, "Failed to get subject analytics");
    return { success: false, error: "科目別統計の取得に失敗しました" };
  }
}

/**
 * 学習継続日数（ストリーク）を取得
 */
export async function getStudyStreak(): Promise<ActionResult<number>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    // 過去90日分の学習セッションを取得
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const sessions = await prisma.studySession.findMany({
      where: {
        userId: session.user.id,
        startTime: { gte: ninetyDaysAgo },
        endTime: { not: null },
      },
      select: {
        startTime: true,
      },
      orderBy: { startTime: "desc" },
    });

    // 日付のセットを作成
    const studyDates = new Set(
      sessions.map((s) => s.startTime.toISOString().split("T")[0])
    );

    // 連続日数を計算
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 90; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];

      if (studyDates.has(dateStr)) {
        streak++;
      } else if (i > 0) {
        // 今日以外で途切れたら終了
        break;
      }
    }

    return { success: true, data: streak };
  } catch (error) {
    logger.error({ error }, "Failed to get study streak");
    return { success: false, error: "継続日数の取得に失敗しました" };
  }
}
