import { z } from "zod";

/**
 * 統計期間スキーマ
 */
export const AnalyticsPeriodSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export type AnalyticsPeriodInput = z.infer<typeof AnalyticsPeriodSchema>;

/**
 * 科目別統計スキーマ
 */
export const SubjectAnalyticsSchema = z.object({
  period: z.enum(["week", "month", "year"]).default("week"),
});

export type SubjectAnalyticsInput = z.infer<typeof SubjectAnalyticsSchema>;
