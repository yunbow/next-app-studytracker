import { z } from "zod";

export const CreateStudySessionSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  duration: z.number().int().min(0).max(86400).optional(),
  subject: z.string().max(100, "Subject too long").optional(),
  description: z.string().max(1000, "Description too long").optional(),
  tags: z.string().max(200, "Tags too long").optional(),
  visibility: z.enum(["public", "followers", "private"]).default("private"),
  goalId: z.string().cuid().optional(),
});

export const UpdateStudySessionSchema = z.object({
  id: z.string().cuid(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  duration: z.number().int().min(0).max(86400).optional(),
  subject: z.string().max(100, "Subject too long").optional(),
  description: z.string().max(1000, "Description too long").optional(),
  tags: z.string().max(200, "Tags too long").optional(),
  visibility: z.enum(["public", "followers", "private"]).optional(),
  goalId: z.string().cuid().optional(),
});

export const CreateGoalSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  targetHours: z.number().int().min(1).max(10000).optional(),
  deadline: z.string().datetime().optional(),
  subject: z.string().max(100, "Subject too long").optional(),
  tags: z.string().max(200, "Tags too long").optional(),
  visibility: z.enum(["public", "followers", "private"]).default("private"),
});

export const UpdateGoalSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1, "Title is required").max(200, "Title too long").optional(),
  description: z.string().max(1000, "Description too long").optional(),
  targetHours: z.number().int().min(1).max(10000).optional(),
  deadline: z.string().datetime().optional(),
  status: z.enum(["active", "completed", "archived"]).optional(),
  subject: z.string().max(100, "Subject too long").optional(),
  tags: z.string().max(200, "Tags too long").optional(),
  visibility: z.enum(["public", "followers", "private"]).optional(),
});

export const CreateCommentSchema = z.object({
  sessionId: z.string().cuid(),
  content: z.string().min(1, "Content is required").max(500, "Content too long"),
});

export const CreateReactionSchema = z.object({
  sessionId: z.string().cuid(),
  type: z.enum(["like", "heart", "clap", "fire"]),
});

export type CreateStudySessionInput = z.infer<typeof CreateStudySessionSchema>;
export type UpdateStudySessionInput = z.infer<typeof UpdateStudySessionSchema>;
export type CreateGoalInput = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalInput = z.infer<typeof UpdateGoalSchema>;
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type CreateReactionInput = z.infer<typeof CreateReactionSchema>;
