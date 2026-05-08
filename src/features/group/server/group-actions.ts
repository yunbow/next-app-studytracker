"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger, logSecurityEvent } from "@/lib/logger";
import type { ActionResult } from "@/lib/types/action-result";
import { ERROR_CODES } from "@/lib/types/error-codes";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { checkPlanGate } from "@/lib/stripe/plan-gate";
import { revalidatePath } from "next/cache";
import {
  CreateStudyGroupSchema,
  UpdateStudyGroupSchema,
  AddGroupMemberSchema,
  CreateStudyRoomSchema,
  JoinStudyRoomSchema,
  LeaveStudyRoomSchema,
  SearchGroupsSchema,
  TransferGroupOwnershipSchema,
  type CreateStudyGroupInput,
  type UpdateStudyGroupInput,
  type AddGroupMemberInput,
  type CreateStudyRoomInput,
  type JoinStudyRoomInput,
  type LeaveStudyRoomInput,
  type SearchGroupsInput,
  type TransferGroupOwnershipInput,
} from "../schema/group-schema";

/**
 * 学習グループを作成
 */
export async function createStudyGroup(
  input: CreateStudyGroupInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です", code: ERROR_CODES.UNAUTHORIZED };
    }

    // Rate Limiting
    if (!checkRateLimit(`group:create:${session.user.id}`, RATE_LIMITS.WRITE)) {
      return {
        success: false,
        error: "リクエストが多すぎます。しばらく待ってから再試行してください。",
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      };
    }

    const planCheck = await checkPlanGate(session.user.id, "premium");
    if (!planCheck.allowed) return { success: false, error: planCheck.error };

    const validated = CreateStudyGroupSchema.parse(input);

    const group = await prisma.studyGroup.create({
      data: {
        ...validated,
        ownerId: session.user.id,
      },
    });

    // オーナーをメンバーとして追加
    await prisma.studyGroupMember.create({
      data: {
        userId: session.user.id,
        groupId: group.id,
        role: "owner",
      },
    });

    logger.info({ groupId: group.id, userId: session.user.id }, "Study group created");
    revalidatePath("/groups");

    return { success: true, data: { id: group.id } };
  } catch (error) {
    logger.error({ error }, "Failed to create study group");
    return { success: false, error: "グループの作成に失敗しました" };
  }
}

/**
 * 学習グループを更新
 */
export async function updateStudyGroup(
  input: UpdateStudyGroupInput
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = UpdateStudyGroupSchema.parse(input);

    const group = await prisma.studyGroup.findUnique({
      where: { id: validated.id },
      select: { ownerId: true },
    });

    if (!group) {
      return { success: false, error: "グループが見つかりません" };
    }

    // ownerId === null はオーナーが退会し孤児化した状態。誰も編集不可。
    // 編集権を取り戻すには transferGroupOwnership を経由する必要がある。
    if (group.ownerId === null || group.ownerId !== session.user.id) {
      logSecurityEvent("IDOR_ATTEMPT", {
        userId: session.user.id,
        groupId: validated.id,
        action: "update_study_group",
      });
      return { success: false, error: "このグループを編集する権限がありません" };
    }

    await prisma.studyGroup.update({
      where: { id: validated.id },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.subject !== undefined && { subject: validated.subject }),
        ...(validated.isPrivate !== undefined && { isPrivate: validated.isPrivate }),
        ...(validated.maxMembers && { maxMembers: validated.maxMembers }),
      },
    });

    logger.info({ groupId: validated.id, userId: session.user.id }, "Study group updated");
    revalidatePath("/groups");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to update study group");
    return { success: false, error: "グループの更新に失敗しました" };
  }
}

/**
 * グループメンバーを追加
 */
export async function addGroupMember(
  input: AddGroupMemberInput
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = AddGroupMemberSchema.parse(input);

    const group = await prisma.studyGroup.findUnique({
      where: { id: validated.groupId },
      include: {
        members: true,
        _count: { select: { members: true } },
      },
    });

    if (!group) {
      return { success: false, error: "グループが見つかりません" };
    }

    // メンバー数チェック
    if (group._count.members >= group.maxMembers) {
      return { success: false, error: "グループが満員です" };
    }

    // 既にメンバーかチェック
    const existingMember = await prisma.studyGroupMember.findUnique({
      where: {
        userId_groupId: {
          userId: validated.userId,
          groupId: validated.groupId,
        },
      },
    });

    if (existingMember) {
      return { success: false, error: "既にメンバーです" };
    }

    await prisma.studyGroupMember.create({
      data: validated,
    });

    logger.info(
      { groupId: validated.groupId, newMemberId: validated.userId },
      "Group member added"
    );
    revalidatePath("/groups");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to add group member");
    return { success: false, error: "メンバーの追加に失敗しました" };
  }
}

/**
 * グループから退出
 */
export async function leaveGroup(groupId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId },
      select: { ownerId: true },
    });

    if (!group) {
      return { success: false, error: "グループが見つかりません" };
    }

    // ownerId が設定されていて自分がそのオーナーである場合のみ退出を拒否（譲渡を促す）。
    // ownerId=null（既に孤児化したグループ）の場合は通常メンバーとして退出可。
    if (group.ownerId !== null && group.ownerId === session.user.id) {
      return {
        success: false,
        error: "オーナーは退出できません。先に transferGroupOwnership で譲渡してください",
      };
    }

    await prisma.studyGroupMember.delete({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId,
        },
      },
    });

    logger.info({ groupId, userId: session.user.id }, "Left study group");
    revalidatePath("/groups");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to leave group");
    return { success: false, error: "グループの退出に失敗しました" };
  }
}

/**
 * スタディルームを作成
 */
export async function createStudyRoom(
  input: CreateStudyRoomInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const planCheck = await checkPlanGate(session.user.id, "premium");
    if (!planCheck.allowed) return { success: false, error: planCheck.error };

    const validated = CreateStudyRoomSchema.parse(input);

    // グループメンバーかチェック
    const member = await prisma.studyGroupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: validated.groupId,
        },
      },
    });

    if (!member) {
      return { success: false, error: "グループメンバーのみルームを作成できます" };
    }

    const room = await prisma.studyRoom.create({
      data: {
        ...validated,
        startTime: new Date(validated.startTime),
      },
    });

    logger.info({ roomId: room.id, userId: session.user.id }, "Study room created");
    revalidatePath("/groups");

    return { success: true, data: { id: room.id } };
  } catch (error) {
    logger.error({ error }, "Failed to create study room");
    return { success: false, error: "スタディルームの作成に失敗しました" };
  }
}

/**
 * スタディルームに参加
 */
export async function joinStudyRoom(
  input: JoinStudyRoomInput
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = JoinStudyRoomSchema.parse(input);

    const room = await prisma.studyRoom.findUnique({
      where: { id: validated.roomId },
      include: { group: true },
    });

    if (!room) {
      return { success: false, error: "ルームが見つかりません" };
    }

    if (!room.isActive) {
      return { success: false, error: "このルームは終了しています" };
    }

    // グループメンバーかチェック
    const member = await prisma.studyGroupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: room.groupId,
        },
      },
    });

    if (!member) {
      return { success: false, error: "グループメンバーのみ参加できます" };
    }

    // 既に参加中かチェック
    const existing = await prisma.studyRoomParticipant.findFirst({
      where: {
        userId: session.user.id,
        roomId: validated.roomId,
        leftAt: null,
      },
    });

    if (existing) {
      return { success: false, error: "既に参加しています" };
    }

    await prisma.studyRoomParticipant.create({
      data: {
        userId: session.user.id,
        roomId: validated.roomId,
      },
    });

    logger.info({ roomId: validated.roomId, userId: session.user.id }, "Joined study room");
    revalidatePath("/groups");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to join study room");
    return { success: false, error: "ルームへの参加に失敗しました" };
  }
}

/**
 * スタディルームから退出
 */
export async function leaveStudyRoom(
  input: LeaveStudyRoomInput
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = LeaveStudyRoomSchema.parse(input);

    const participant = await prisma.studyRoomParticipant.findFirst({
      where: {
        userId: session.user.id,
        roomId: validated.roomId,
        leftAt: null,
      },
    });

    if (!participant) {
      return { success: false, error: "参加していません" };
    }

    const leftAt = new Date();
    const duration = Math.floor(
      (leftAt.getTime() - participant.joinedAt.getTime()) / 1000
    );

    await prisma.studyRoomParticipant.update({
      where: { id: participant.id },
      data: { leftAt, duration },
    });

    logger.info({ roomId: validated.roomId, userId: session.user.id }, "Left study room");
    revalidatePath("/groups");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to leave study room");
    return { success: false, error: "ルームからの退出に失敗しました" };
  }
}

/**
 * グループを検索
 */
export async function searchGroups(
  input: SearchGroupsInput
): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = SearchGroupsSchema.parse(input);

    const groups = await prisma.studyGroup.findMany({
      where: {
        OR: [
          { name: { contains: validated.query } },
          { description: { contains: validated.query } },
        ],
        ...(validated.subject && { subject: validated.subject }),
        isPrivate: false,
      },
      take: validated.limit,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    return { success: true, data: groups };
  } catch (error) {
    logger.error({ error }, "Failed to search groups");
    return { success: false, error: "グループ検索に失敗しました" };
  }
}

/**
 * ユーザーのグループ一覧を取得
 */
export async function getUserGroups(): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const memberships = await prisma.studyGroupMember.findMany({
      where: { userId: session.user.id },
      include: {
        group: {
          include: {
            owner: {
              select: {
                id: true,
                username: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: { members: true },
            },
          },
        },
      },
    });

    return { success: true, data: memberships };
  } catch (error) {
    logger.error({ error }, "Failed to get user groups");
    return { success: false, error: "グループ一覧の取得に失敗しました" };
  }
}

/**
 * グループのオーナーを別メンバーに譲渡する
 *
 * Why: `StudyGroup.owner` は SetNull に変更したため、オーナーが退会すると
 * ownerId=null でグループが孤児化する。譲渡経路がなければ孤児グループは編集不能のまま。
 * 本 action はオーナー本人が退会前に譲渡するメインの経路で、
 *   1. 現オーナー（または孤児化されていて自身が admin）
 *   2. 新オーナー候補が同グループの既存メンバー
 * の条件を満たすときに譲渡を実行する。
 *
 * トランザクションで StudyGroup.ownerId 変更と StudyGroupMember.role 更新を原子化。
 */
export async function transferGroupOwnership(
  input: TransferGroupOwnershipInput
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です", code: ERROR_CODES.UNAUTHORIZED };
    }

    if (!checkRateLimit(`group:transfer:${session.user.id}`, RATE_LIMITS.WRITE)) {
      return {
        success: false,
        error: "リクエストが多すぎます。しばらく待ってから再試行してください。",
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      };
    }

    const validated = TransferGroupOwnershipSchema.parse(input);

    if (validated.newOwnerId === session.user.id) {
      return { success: false, error: "同じユーザーへの譲渡はできません" };
    }

    try {
      await prisma.$transaction(async (tx) => {
        const group = await tx.studyGroup.findUnique({
          where: { id: validated.groupId },
          select: { ownerId: true },
        });
        if (!group) {
          throw new TransferError("GROUP_NOT_FOUND");
        }

        // 譲渡を許可する条件:
        //   A. 現オーナー本人による譲渡
        //   B. オーナー退会で孤児化（ownerId=null）したグループを admin メンバーが引き取る
        if (group.ownerId === null) {
          const selfMembership = await tx.studyGroupMember.findUnique({
            where: {
              userId_groupId: { userId: session.user.id, groupId: validated.groupId },
            },
            select: { role: true },
          });
          if (!selfMembership || selfMembership.role !== "admin") {
            logSecurityEvent("IDOR_ATTEMPT", {
              userId: session.user.id,
              groupId: validated.groupId,
              action: "claim_orphaned_group",
            });
            throw new TransferError("FORBIDDEN");
          }
        } else if (group.ownerId !== session.user.id) {
          logSecurityEvent("IDOR_ATTEMPT", {
            userId: session.user.id,
            groupId: validated.groupId,
            action: "transfer_group_ownership",
          });
          throw new TransferError("FORBIDDEN");
        }

        const newOwnerMembership = await tx.studyGroupMember.findUnique({
          where: {
            userId_groupId: { userId: validated.newOwnerId, groupId: validated.groupId },
          },
          select: { id: true },
        });
        if (!newOwnerMembership) {
          throw new TransferError("NEW_OWNER_NOT_MEMBER");
        }

        // StudyGroup.ownerId を新オーナーに切替
        await tx.studyGroup.update({
          where: { id: validated.groupId },
          data: { ownerId: validated.newOwnerId },
        });

        // 新オーナーの role を "owner" に昇格
        await tx.studyGroupMember.update({
          where: {
            userId_groupId: { userId: validated.newOwnerId, groupId: validated.groupId },
          },
          data: { role: "owner" },
        });

        // 旧オーナー（呼び出し元が現オーナーの場合）を admin に降格。
        // 孤児化したグループを admin が引き取ったケースでは旧オーナーは既に退会済みのため
        // 該当 StudyGroupMember 行は onDelete Cascade で存在しない → 追加処理不要。
        if (group.ownerId !== null && group.ownerId === session.user.id) {
          await tx.studyGroupMember.update({
            where: {
              userId_groupId: { userId: group.ownerId, groupId: validated.groupId },
            },
            data: { role: "admin" },
          });
        }
      });
    } catch (txError) {
      if (txError instanceof TransferError) {
        switch (txError.reason) {
          case "GROUP_NOT_FOUND":
            return { success: false, error: "グループが見つかりません" };
          case "FORBIDDEN":
            return { success: false, error: "このグループのオーナーを変更する権限がありません" };
          case "NEW_OWNER_NOT_MEMBER":
            return { success: false, error: "新オーナーはこのグループのメンバーではありません" };
        }
      }
      throw txError;
    }

    logger.info(
      { groupId: validated.groupId, newOwnerId: validated.newOwnerId, by: session.user.id },
      "Group ownership transferred"
    );
    revalidatePath("/groups");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to transfer group ownership");
    return { success: false, error: "オーナー譲渡に失敗しました" };
  }
}

type TransferReason = "GROUP_NOT_FOUND" | "FORBIDDEN" | "NEW_OWNER_NOT_MEMBER";
class TransferError extends Error {
  constructor(public readonly reason: TransferReason) {
    super(reason);
    this.name = "TransferError";
  }
}
