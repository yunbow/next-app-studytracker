import { z } from "zod";

/**
 * 通知既読スキーマ
 */
export const MarkNotificationReadSchema = z.object({
  notificationId: z.string().min(1, "通知IDは必須です"),
});

export type MarkNotificationReadInput = z.infer<typeof MarkNotificationReadSchema>;

/**
 * 全通知既読スキーマ
 */
export const MarkAllNotificationsReadSchema = z.object({
  // パラメータなし
});

export type MarkAllNotificationsReadInput = z.infer<typeof MarkAllNotificationsReadSchema>;
