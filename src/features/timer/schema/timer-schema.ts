import { z } from "zod";

/**
 * タイマー設定スキーマ
 */
export const TimerSettingsSchema = z.object({
  pomodoroMinutes: z.number().int().min(1).max(120).default(25),
  shortBreakMinutes: z.number().int().min(1).max(30).default(5),
  longBreakMinutes: z.number().int().min(1).max(60).default(15),
  longBreakInterval: z.number().int().min(1).max(10).default(4),
  autoStartBreaks: z.boolean().default(false),
  autoStartPomodoros: z.boolean().default(false),
});

export type TimerSettingsInput = z.infer<typeof TimerSettingsSchema>;

/**
 * タイマー開始スキーマ
 */
export const StartTimerSchema = z.object({
  goalId: z.string().optional(),
  subject: z.string().optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
});

export type StartTimerInput = z.infer<typeof StartTimerSchema>;

/**
 * タイマー停止スキーマ
 */
export const StopTimerSchema = z.object({
  sessionId: z.string().min(1),
  visibility: z.enum(["public", "followers", "private"]).default("private"),
});

export type StopTimerInput = z.infer<typeof StopTimerSchema>;
