import { z } from "zod";

// 高度な分析ダッシュボード取得
export const GetAdvancedAnalyticsSchema = z.object({
  userId: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export type GetAdvancedAnalyticsInput = z.infer<typeof GetAdvancedAnalyticsSchema>;

// 学習効率スコア取得
export const GetEfficiencyScoreSchema = z.object({
  userId: z.string().optional(),
  period: z.enum(["week", "month", "year"]).default("month"),
});

export type GetEfficiencyScoreInput = z.infer<typeof GetEfficiencyScoreSchema>;

// 科目バランス分析
export const GetSubjectBalanceSchema = z.object({
  userId: z.string().optional(),
  period: z.enum(["week", "month", "year"]).default("month"),
});

export type GetSubjectBalanceInput = z.infer<typeof GetSubjectBalanceSchema>;

// 目標達成予測
export const PredictGoalAchievementSchema = z.object({
  goalId: z.string(),
});

export type PredictGoalAchievementInput = z.infer<typeof PredictGoalAchievementSchema>;

// 月次レポート生成
export const GenerateMonthlyReportSchema = z.object({
  userId: z.string().optional(),
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
});

export type GenerateMonthlyReportInput = z.infer<typeof GenerateMonthlyReportSchema>;
