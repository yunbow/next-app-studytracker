import { z } from "zod";

// メンタープロフィール作成
export const CreateMentorProfileSchema = z.object({
  bio: z.string().max(1000).optional(),
  expertise: z.string().min(1, "得意科目は必須です"), // カンマ区切り
  experience: z.string().max(1000).optional(),
  availability: z.string().max(500).optional(),
  hourlyRate: z.number().int().min(0).optional(),
});

export type CreateMentorProfileInput = z.infer<typeof CreateMentorProfileSchema>;

// メンタープロフィール更新
export const UpdateMentorProfileSchema = z.object({
  bio: z.string().max(1000).optional(),
  expertise: z.string().optional(),
  experience: z.string().max(1000).optional(),
  availability: z.string().max(500).optional(),
  hourlyRate: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateMentorProfileInput = z.infer<typeof UpdateMentorProfileSchema>;

// メンタリングセッション作成
export const CreateMentoringSessionSchema = z.object({
  mentorId: z.string(),
  subject: z.string().min(1, "科目は必須です").max(100),
  description: z.string().max(1000).optional(),
  scheduledAt: z.string().datetime(),
  duration: z.number().int().min(15).max(180).default(60),
});

export type CreateMentoringSessionInput = z.infer<typeof CreateMentoringSessionSchema>;

// セッションステータス更新
export const UpdateSessionStatusSchema = z.object({
  sessionId: z.string(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
  notes: z.string().max(1000).optional(),
});

export type UpdateSessionStatusInput = z.infer<typeof UpdateSessionStatusSchema>;

// メンターレビュー作成
export const CreateMentorReviewSchema = z.object({
  sessionId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export type CreateMentorReviewInput = z.infer<typeof CreateMentorReviewSchema>;

// メンター検索
export const SearchMentorsSchema = z.object({
  subject: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export type SearchMentorsInput = z.infer<typeof SearchMentorsSchema>;
