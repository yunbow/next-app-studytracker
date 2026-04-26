import { z } from "zod";

// リマインダー作成
export const CreateReminderSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").max(100),
  description: z.string().max(500).optional(),
  reminderTime: z.string().datetime(),
  frequency: z.enum(["once", "daily", "weekly", "custom"]).default("once"),
  daysOfWeek: z.string().optional(), // "0,1,2,3,4,5,6"
});

export type CreateReminderInput = z.infer<typeof CreateReminderSchema>;

// リマインダー更新
export const UpdateReminderSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  reminderTime: z.string().datetime().optional(),
  frequency: z.enum(["once", "daily", "weekly", "custom"]).optional(),
  daysOfWeek: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateReminderInput = z.infer<typeof UpdateReminderSchema>;

// 習慣作成
export const CreateHabitSchema = z.object({
  name: z.string().min(1, "習慣名は必須です").max(100),
  description: z.string().max(500).optional(),
  targetDays: z.number().int().min(1).max(365).default(21),
  frequency: z.enum(["daily", "weekly"]).default("daily"),
});

export type CreateHabitInput = z.infer<typeof CreateHabitSchema>;

// 習慣更新
export const UpdateHabitSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  targetDays: z.number().int().min(1).max(365).optional(),
  frequency: z.enum(["daily", "weekly"]).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateHabitInput = z.infer<typeof UpdateHabitSchema>;

// 習慣ログ記録
export const LogHabitSchema = z.object({
  habitId: z.string(),
  date: z.string().datetime().optional(),
  completed: z.boolean().default(true),
  note: z.string().max(500).optional(),
});

export type LogHabitInput = z.infer<typeof LogHabitSchema>;
