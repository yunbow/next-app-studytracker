"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/lib/types/action-result";
import { revalidatePath } from "next/cache";
import {
  MarkNotificationReadSchema,
  type MarkNotificationReadInput,
} from "../schema/notification-schema";

/**
 * 通知を既読にする
 */
export async function markNotificationRead(
  input: MarkNotificationReadInput
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = MarkNotificationReadSchema.parse(input);

    const notification = await prisma.notification.findUnique({
      where: { id: validated.notificationId },
      select: { recipientId: true },
    });

    if (!notification) {
      return { success: false, error: "通知が見つかりません" };
    }

    if (notification.recipientId !== session.user.id) {
      return { success: false, error: "この通知を操作する権限がありません" };
    }

    await prisma.notification.update({
      where: { id: validated.notificationId },
      data: { read: true },
    });

    logger.info(
      { userId: session.user.id, notificationId: validated.notificationId },
      "Notification marked as read"
    );
    revalidatePath("/notifications");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to mark notification as read");
    return { success: false, error: "通知の既読化に失敗しました" };
  }
}

/**
 * すべての通知を既読にする
 */
export async function markAllNotificationsRead(): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    await prisma.notification.updateMany({
      where: {
        recipientId: session.user.id,
        read: false,
      },
      data: { read: true },
    });

    logger.info({ userId: session.user.id }, "All notifications marked as read");
    revalidatePath("/notifications");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to mark all notifications as read");
    return { success: false, error: "通知の一括既読化に失敗しました" };
  }
}

/**
 * 未読通知数を取得
 */
export async function getUnreadNotificationCount(): Promise<ActionResult<number>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const count = await prisma.notification.count({
      where: {
        recipientId: session.user.id,
        read: false,
      },
    });

    return { success: true, data: count };
  } catch (error) {
    logger.error({ error }, "Failed to get unread notification count");
    return { success: false, error: "未読通知数の取得に失敗しました" };
  }
}

/**
 * 通知一覧を取得
 */
export async function getNotifications(
  limit: number = 20,
  cursor?: string
): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: session.user.id,
        ...(cursor && { id: { lt: cursor } }),
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return { success: true, data: notifications };
  } catch (error) {
    logger.error({ error }, "Failed to get notifications");
    return { success: false, error: "通知の取得に失敗しました" };
  }
}
