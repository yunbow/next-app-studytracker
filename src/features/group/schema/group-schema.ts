import { z } from "zod";

// 学習グループ作成
export const CreateStudyGroupSchema = z.object({
  name: z.string().min(1, "グループ名は必須です").max(100),
  description: z.string().max(500).optional(),
  subject: z.string().max(50).optional(),
  isPrivate: z.boolean().default(false),
  maxMembers: z.number().int().min(2).max(100).default(50),
});

export type CreateStudyGroupInput = z.infer<typeof CreateStudyGroupSchema>;

// 学習グループ更新
export const UpdateStudyGroupSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  subject: z.string().max(50).optional(),
  isPrivate: z.boolean().optional(),
  maxMembers: z.number().int().min(2).max(100).optional(),
});

export type UpdateStudyGroupInput = z.infer<typeof UpdateStudyGroupSchema>;

// グループメンバー追加
export const AddGroupMemberSchema = z.object({
  groupId: z.string(),
  userId: z.string(),
  role: z.enum(["member", "admin"]).default("member"),
});

export type AddGroupMemberInput = z.infer<typeof AddGroupMemberSchema>;

// スタディルーム作成
export const CreateStudyRoomSchema = z.object({
  groupId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  startTime: z.string().datetime(),
});

export type CreateStudyRoomInput = z.infer<typeof CreateStudyRoomSchema>;

// スタディルーム参加
export const JoinStudyRoomSchema = z.object({
  roomId: z.string(),
});

export type JoinStudyRoomInput = z.infer<typeof JoinStudyRoomSchema>;

// スタディルーム退出
export const LeaveStudyRoomSchema = z.object({
  roomId: z.string(),
});

export type LeaveStudyRoomInput = z.infer<typeof LeaveStudyRoomSchema>;

// グループ検索
export const SearchGroupsSchema = z.object({
  query: z.string().min(1),
  subject: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export type SearchGroupsInput = z.infer<typeof SearchGroupsSchema>;

// オーナー譲渡
export const TransferGroupOwnershipSchema = z.object({
  groupId: z.string(),
  newOwnerId: z.string(),
});

export type TransferGroupOwnershipInput = z.infer<typeof TransferGroupOwnershipSchema>;
