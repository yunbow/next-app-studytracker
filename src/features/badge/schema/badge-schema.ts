import { z } from "zod";

/**
 * バッジ作成スキーマ（管理者用）
 */
export const CreateBadgeSchema = z.object({
  name: z.string().min(1, "バッジ名は必須です").max(50),
  description: z.string().min(1, "説明は必須です").max(200),
  icon: z.string().min(1, "アイコンは必須です"),
  condition: z.string().min(1, "達成条件は必須です").max(200),
});

export type CreateBadgeInput = z.infer<typeof CreateBadgeSchema>;
