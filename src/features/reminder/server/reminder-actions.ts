"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger, logSecurityEvent } from "@/lib/logger";
import type { ActionResult } from "@/lib/types/action-result";
import { revalidatePath } from "next/cache";
import { checkPlanGate } from "@/lib/stripe/plan-gate";
import {
  CreateReminderSchema,
  UpdateReminderSchema,
  CreateHabitSchema,
  UpdateHabitSchema,
  LogHabitSchema,
  type CreateReminderInput,
  type UpdateReminderInput,
  type CreateHabitInput,
  type UpdateHabitInput,
  type LogHabitInput,
} from "../schema/reminder-schema";

/**
 * リマインダーを作成
 */
export async function createReminder(
  input: CreateReminderInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const planCheck = await checkPlanGate(session.user.id, "basic");
    if (!planCheck.allowed) return { success: false, error: planCheck.error };

    const validated = CreateReminderSchema.parse(input);

    const reminder = await prisma.reminder.create({
      data: {
        ...validated,
        reminderTime: new Date(validated.reminderTime),
        userId: session.user.id,
      },
    });

    logger.info({ reminderId: reminder.id, userId: session.user.id }, "Reminder created");
    revalidatePath("/reminders");

    return { success: true, data: { id: reminder.id } };
  } catch (error) {
    logger.error({ error }, "Failed to create reminder");
    return { success: false, error: "リマインダーの作成に失敗しました" };
  }
}

/**
 * リマインダーを更新
 */
export async function updateReminder(
  input: UpdateReminderInput
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = UpdateReminderSchema.parse(input);

    const reminder = await prisma.reminder.findUnique({
      where: { id: validated.id },
      select: { userId: true },
    });

    if (!reminder) {
      return { success: false, error: "リマインダーが見つかりません" };
    }

    if (reminder.userId !== session.user.id) {
      logSecurityEvent("IDOR_ATTEMPT", {
        userId: session.user.id,
        reminderId: validated.id,
        action: "update_reminder",
      });
      return { success: false, error: "このリマインダーを編集する権限がありません" };
    }

    await prisma.reminder.update({
      where: { id: validated.id },
      data: {
        ...(validated.title && { title: validated.title }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.reminderTime && { reminderTime: new Date(validated.reminderTime) }),
        ...(validated.frequency && { frequency: validated.frequency }),
        ...(validated.daysOfWeek !== undefined && { daysOfWeek: validated.daysOfWeek }),
        ...(validated.isActive !== undefined && { isActive: validated.isActive }),
      },
    });

    logger.info({ reminderId: validated.id, userId: session.user.id }, "Reminder updated");
    revalidatePath("/reminders");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to update reminder");
    return { success: false, error: "リマインダーの更新に失敗しました" };
  }
}

/**
 * リマインダーを削除
 */
export async function deleteReminder(id: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const reminder = await prisma.reminder.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!reminder) {
      return { success: false, error: "リマインダーが見つかりません" };
    }

    if (reminder.userId !== session.user.id) {
      logSecurityEvent("IDOR_ATTEMPT", {
        userId: session.user.id,
        reminderId: id,
        action: "delete_reminder",
      });
      return { success: false, error: "このリマインダーを削除する権限がありません" };
    }

    await prisma.reminder.delete({ where: { id } });

    logger.info({ reminderId: id, userId: session.user.id }, "Reminder deleted");
    revalidatePath("/reminders");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to delete reminder");
    return { success: false, error: "リマインダーの削除に失敗しました" };
  }
}

/**
 * ユーザーのリマインダー一覧を取得
 */
export async function getUserReminders(): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const reminders = await prisma.reminder.findMany({
      where: { userId: session.user.id },
      orderBy: { reminderTime: "asc" },
    });

    return { success: true, data: reminders };
  } catch (error) {
    logger.error({ error }, "Failed to get user reminders");
    return { success: false, error: "リマインダー一覧の取得に失敗しました" };
  }
}

/**
 * 習慣を作成
 */
export async function createHabit(
  input: CreateHabitInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const planCheck = await checkPlanGate(session.user.id, "premium");
    if (!planCheck.allowed) return { success: false, error: planCheck.error };

    const validated = CreateHabitSchema.parse(input);

    const habit = await prisma.habit.create({
      data: {
        ...validated,
        userId: session.user.id,
      },
    });

    logger.info({ habitId: habit.id, userId: session.user.id }, "Habit created");
    revalidatePath("/habits");

    return { success: true, data: { id: habit.id } };
  } catch (error) {
    logger.error({ error }, "Failed to create habit");
    return { success: false, error: "習慣の作成に失敗しました" };
  }
}

/**
 * 習慣を更新
 */
export async function updateHabit(
  input: UpdateHabitInput
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = UpdateHabitSchema.parse(input);

    const habit = await prisma.habit.findUnique({
      where: { id: validated.id },
      select: { userId: true },
    });

    if (!habit) {
      return { success: false, error: "習慣が見つかりません" };
    }

    if (habit.userId !== session.user.id) {
      logSecurityEvent("IDOR_ATTEMPT", {
        userId: session.user.id,
        habitId: validated.id,
        action: "update_habit",
      });
      return { success: false, error: "この習慣を編集する権限がありません" };
    }

    await prisma.habit.update({
      where: { id: validated.id },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.targetDays && { targetDays: validated.targetDays }),
        ...(validated.frequency && { frequency: validated.frequency }),
        ...(validated.isActive !== undefined && { isActive: validated.isActive }),
      },
    });

    logger.info({ habitId: validated.id, userId: session.user.id }, "Habit updated");
    revalidatePath("/habits");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to update habit");
    return { success: false, error: "習慣の更新に失敗しました" };
  }
}

/**
 * 習慣を削除
 */
export async function deleteHabit(id: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const habit = await prisma.habit.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!habit) {
      return { success: false, error: "習慣が見つかりません" };
    }

    if (habit.userId !== session.user.id) {
      logSecurityEvent("IDOR_ATTEMPT", {
        userId: session.user.id,
        habitId: id,
        action: "delete_habit",
      });
      return { success: false, error: "この習慣を削除する権限がありません" };
    }

    await prisma.habit.delete({ where: { id } });

    logger.info({ habitId: id, userId: session.user.id }, "Habit deleted");
    revalidatePath("/habits");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to delete habit");
    return { success: false, error: "習慣の削除に失敗しました" };
  }
}

/**
 * 習慣ログを記録
 */
export async function logHabit(input: LogHabitInput): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = LogHabitSchema.parse(input);

    const habit = await prisma.habit.findUnique({
      where: { id: validated.habitId },
      select: { userId: true },
    });

    if (!habit) {
      return { success: false, error: "習慣が見つかりません" };
    }

    if (habit.userId !== session.user.id) {
      logSecurityEvent("IDOR_ATTEMPT", {
        userId: session.user.id,
        habitId: validated.habitId,
        action: "log_habit",
      });
      return { success: false, error: "この習慣を記録する権限がありません" };
    }

    const logDate = validated.date ? new Date(validated.date) : new Date();
    logDate.setHours(0, 0, 0, 0);

    await prisma.habitLog.upsert({
      where: {
        habitId_date: {
          habitId: validated.habitId,
          date: logDate,
        },
      },
      update: {
        completed: validated.completed,
        note: validated.note,
      },
      create: {
        habitId: validated.habitId,
        userId: session.user.id,
        date: logDate,
        completed: validated.completed,
        note: validated.note,
      },
    });

    logger.info({ habitId: validated.habitId, userId: session.user.id }, "Habit logged");
    revalidatePath("/habits");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to log habit");
    return { success: false, error: "習慣の記録に失敗しました" };
  }
}

/**
 * 習慣の継続日数を取得
 */
export async function getHabitStreak(habitId: string): Promise<ActionResult<number>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      select: { userId: true },
    });

    if (!habit) {
      return { success: false, error: "習慣が見つかりません" };
    }

    if (habit.userId !== session.user.id) {
      return { success: false, error: "この習慣を閲覧する権限がありません" };
    }

    // 過去90日分のログを取得
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const logs = await prisma.habitLog.findMany({
      where: {
        habitId,
        date: { gte: ninetyDaysAgo },
        completed: true,
      },
      select: { date: true },
      orderBy: { date: "desc" },
    });

    const logDates = new Set(
      logs.map((log: { date: Date }) => log.date.toISOString().split("T")[0])
    );

    // 連続日数を計算
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 90; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];

      if (logDates.has(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return { success: true, data: streak };
  } catch (error) {
    logger.error({ error }, "Failed to get habit streak");
    return { success: false, error: "継続日数の取得に失敗しました" };
  }
}

/**
 * ユーザーの習慣一覧を取得
 */
export async function getUserHabits(): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const habits = await prisma.habit.findMany({
      where: { userId: session.user.id },
      include: {
        logs: {
          where: {
            date: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)),
            },
          },
          orderBy: { date: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: habits };
  } catch (error) {
    logger.error({ error }, "Failed to get user habits");
    return { success: false, error: "習慣一覧の取得に失敗しました" };
  }
}
