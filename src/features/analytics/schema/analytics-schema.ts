import { z } from "zod";

/**
 * 統計期間スキーマ
 */
export const AnalyticsPeriodSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  userId: z.string().optional(), // 指定しない場合は自分の統計
});

export type AnalyticsPeriodInput = z.infer<typeof AnalyticsPeriodSchema>;

/**
 * 科目別統計スキーマ
 */
export const SubjectAnalyticsSchema = z.object({
  period: z.enum(["week", "month", "year"]).default("week"),
  userId: z.string().optional(),
});

export type SubjectAnalyticsInput = z.infer<typeof SubjectAnalyticsSchema>;
