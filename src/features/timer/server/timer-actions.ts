"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/lib/types/action-result";
import { revalidatePath } from "next/cache";
import {
  StartTimerSchema,
  StopTimerSchema,
  type StartTimerInput,
  type StopTimerInput,
} from "../schema/timer-schema";
import { checkAndAwardBadges } from "@/features/badge/server/badge-actions";

/**
 * タイマーを開始（学習セッションを作成）
 */
export async function startTimer(
  input: StartTimerInput
): Promise<ActionResult<{ sessionId: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = StartTimerSchema.parse(input);

    // 進行中のセッションがないかチェック
    const activeSession = await prisma.studySession.findFirst({
      where: {
        userId: session.user.id,
        endTime: null,
      },
    });

    if (activeSession) {
      return {
        success: false,
        error: "既に進行中のセッションがあります。先に停止してください。",
      };
    }

    const studySession = await prisma.studySession.create({
      data: {
        userId: session.user.id,
        startTime: new Date(),
        goalId: validated.goalId,
        subject: validated.subject,
        description: validated.description,
        tags: validated.tags,
        visibility: "private", // デフォルトは非公開
      },
    });

    logger.info(
      { sessionId: studySession.id, userId: session.user.id },
      "Timer started"
    );

    return { success: true, data: { sessionId: studySession.id } };
  } catch (error) {
    logger.error({ error }, "Failed to start timer");
    return { success: false, error: "タイマーの開始に失敗しました" };
  }
}

/**
 * タイマーを停止（学習セッションを終了）
 */
export async function stopTimer(
  input: StopTimerInput
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = StopTimerSchema.parse(input);

    const studySession = await prisma.studySession.findUnique({
      where: { id: validated.sessionId },
      select: { userId: true, startTime: true, endTime: true },
    });

    if (!studySession) {
      return { success: false, error: "セッションが見つかりません" };
    }

    if (studySession.userId !== session.user.id) {
      return { success: false, error: "このセッションを操作する権限がありません" };
    }

    if (studySession.endTime) {
      return { success: false, error: "このセッションは既に終了しています" };
    }

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - studySession.startTime.getTime()) / 1000
    );

    await prisma.studySession.update({
      where: { id: validated.sessionId },
      data: {
        endTime,
        duration,
        visibility: validated.visibility,
      },
    });

    // バッジチェック（非同期）
    checkAndAwardBadges(session.user.id).catch((error) => {
      logger.error({ error, userId: session.user.id }, "Failed to check badges");
    });

    logger.info(
      { sessionId: validated.sessionId, userId: session.user.id, duration },
      "Timer stopped"
    );
    revalidatePath("/dashboard");
    revalidatePath("/timeline");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to stop timer");
    return { success: false, error: "タイマーの停止に失敗しました" };
  }
}

/**
 * 進行中のタイマーを取得
 */
export async function getActiveTimer(): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const activeSession = await prisma.studySession.findFirst({
      where: {
        userId: session.user.id,
        endTime: null,
      },
      include: {
        goal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return { success: true, data: activeSession };
  } catch (error) {
    logger.error({ error }, "Failed to get active timer");
    return { success: false, error: "進行中のタイマーの取得に失敗しました" };
  }
}
