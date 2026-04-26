import { z } from "zod";

/**
 * フォロースキーマ
 */
export const FollowUserSchema = z.object({
  targetUserId: z.string().min(1, "ユーザーIDは必須です"),
});

export type FollowUserInput = z.infer<typeof FollowUserSchema>;

/**
 * フォローリクエスト承認スキーマ
 */
export const AcceptFollowRequestSchema = z.object({
  requestId: z.string().min(1, "リクエストIDは必須です"),
});

export type AcceptFollowRequestInput = z.infer<typeof AcceptFollowRequestSchema>;

/**
 * タイムライン取得スキーマ
 */
export const GetTimelineSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export type GetTimelineInput = z.infer<typeof GetTimelineSchema>;

/**
 * ユーザー検索スキーマ
 */
export const SearchUsersSchema = z.object({
  query: z.string().min(1, "検索キーワードは必須です"),
  limit: z.number().int().min(1).max(50).default(20),
});

export type SearchUsersInput = z.infer<typeof SearchUsersSchema>;
