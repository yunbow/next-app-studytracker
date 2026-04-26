"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger, logSecurityEvent } from "@/lib/logger";
import type { ActionResult } from "@/lib/types/action-result";
import { revalidatePath } from "next/cache";
import {
  FollowUserSchema,
  AcceptFollowRequestSchema,
  GetTimelineSchema,
  SearchUsersSchema,
  type FollowUserInput,
  type AcceptFollowRequestInput,
  type GetTimelineInput,
  type SearchUsersInput,
} from "../schema/social-schema";

/**
 * ユーザーをフォロー
 */
export async function followUser(
  input: FollowUserInput
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = FollowUserSchema.parse(input);

    // 自分自身をフォローできない
    if (validated.targetUserId === session.user.id) {
      return { success: false, error: "自分自身をフォローできません" };
    }

    // 対象ユーザーを取得
    const targetUser = await prisma.user.findUnique({
      where: { id: validated.targetUserId },
      select: { isPrivate: true, isSuspended: true },
    });

    if (!targetUser) {
      return { success: false, error: "ユーザーが見つかりません" };
    }

    if (targetUser.isSuspended) {
      return { success: false, error: "このユーザーはアカウント停止中です" };
    }

    // プライベートアカウントの場合はフォローリクエストを作成
    if (targetUser.isPrivate) {
      const existingRequest = await prisma.followRequest.findUnique({
        where: {
          senderId_receiverId: {
            senderId: session.user.id,
            receiverId: validated.targetUserId,
          },
        },
      });

      if (existingRequest) {
        return { success: false, error: "既にフォローリクエストを送信しています" };
      }

      await prisma.followRequest.create({
        data: {
          senderId: session.user.id,
          receiverId: validated.targetUserId,
        },
      });

      // 通知を作成
      await prisma.notification.create({
        data: {
          type: "follow_request",
          recipientId: validated.targetUserId,
          actorId: session.user.id,
        },
      });

      logger.info(
        { userId: session.user.id, targetUserId: validated.targetUserId },
        "Follow request sent"
      );

      return { success: true, data: undefined };
    }

    // パブリックアカウントの場合は即座にフォロー
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: validated.targetUserId,
        },
      },
    });

    if (existingFollow) {
      return { success: false, error: "既にフォローしています" };
    }

    await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId: validated.targetUserId,
      },
    });

    // 通知を作成
    await prisma.notification.create({
      data: {
        type: "follow",
        recipientId: validated.targetUserId,
        actorId: session.user.id,
      },
    });

    logger.info(
      { userId: session.user.id, targetUserId: validated.targetUserId },
      "User followed"
    );
    revalidatePath("/timeline");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to follow user");
    return { success: false, error: "フォローに失敗しました" };
  }
}

/**
 * フォローを解除
 */
export async function unfollowUser(targetUserId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      },
    });

    logger.info(
      { userId: session.user.id, targetUserId },
      "User unfollowed"
    );
    revalidatePath("/timeline");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to unfollow user");
    return { success: false, error: "フォロー解除に失敗しました" };
  }
}

/**
 * フォローリクエストを承認
 */
export async function acceptFollowRequest(
  input: AcceptFollowRequestInput
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = AcceptFollowRequestSchema.parse(input);

    const request = await prisma.followRequest.findUnique({
      where: { id: validated.requestId },
      select: { senderId: true, receiverId: true },
    });

    if (!request) {
      return { success: false, error: "リクエストが見つかりません" };
    }

    if (request.receiverId !== session.user.id) {
      logSecurityEvent("IDOR_ATTEMPT", {
        userId: session.user.id,
        requestId: validated.requestId,
        action: "accept_follow_request",
      });
      return { success: false, error: "このリクエストを承認する権限がありません" };
    }

    // フォロー関係を作成
    await prisma.follow.create({
      data: {
        followerId: request.senderId,
        followingId: request.receiverId,
      },
    });

    // リクエストを削除
    await prisma.followRequest.delete({
      where: { id: validated.requestId },
    });

    // 通知を作成
    await prisma.notification.create({
      data: {
        type: "follow_accepted",
        recipientId: request.senderId,
        actorId: session.user.id,
      },
    });

    logger.info(
      { userId: session.user.id, requestId: validated.requestId },
      "Follow request accepted"
    );
    revalidatePath("/timeline");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to accept follow request");
    return { success: false, error: "リクエストの承認に失敗しました" };
  }
}

/**
 * フォローリクエストを拒否
 */
export async function rejectFollowRequest(requestId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const request = await prisma.followRequest.findUnique({
      where: { id: requestId },
      select: { receiverId: true },
    });

    if (!request) {
      return { success: false, error: "リクエストが見つかりません" };
    }

    if (request.receiverId !== session.user.id) {
      logSecurityEvent("IDOR_ATTEMPT", {
        userId: session.user.id,
        requestId,
        action: "reject_follow_request",
      });
      return { success: false, error: "このリクエストを拒否する権限がありません" };
    }

    await prisma.followRequest.delete({
      where: { id: requestId },
    });

    logger.info({ userId: session.user.id, requestId }, "Follow request rejected");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to reject follow request");
    return { success: false, error: "リクエストの拒否に失敗しました" };
  }
}

/**
 * タイムラインを取得
 */
export async function getTimeline(
  input: GetTimelineInput
): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = GetTimelineSchema.parse(input);

    // フォローしているユーザーのIDを取得
    const following = await prisma.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    });

    const followingIds = following.map((f: { followingId: string }) => f.followingId);

    // タイムライン = 「フォロー先」スコープのフィード（意図的に follow 限定）。
    // 全 public セッションを発見する経路はプロフィールページ (/users/[id]) で提供する。
    // visibility の正規判定は features/study/server/visibility-helpers の sessionVisibilityWhereForViewer
    // を唯一の判定源とし、タイムラインではフォロー限定として「public/followers」の両方を許可する。
    // （author ∈ followingIds ならば viewer は author の follower なので followers も閲覧可）
    const sessions = await prisma.studySession.findMany({
      where: {
        userId: { in: followingIds },
        visibility: { in: ["public", "followers"] },
        endTime: { not: null },
        ...(validated.cursor && {
          id: { lt: validated.cursor },
        }),
      },
      take: validated.limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
        reactions: {
          select: {
            id: true,
            type: true,
            userId: true,
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 3,
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
    });

    return { success: true, data: sessions };
  } catch (error) {
    logger.error({ error }, "Failed to get timeline");
    return { success: false, error: "タイムラインの取得に失敗しました" };
  }
}

/**
 * ユーザーを検索
 */
export async function searchUsers(
  input: SearchUsersInput
): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = SearchUsersSchema.parse(input);

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: validated.query } },
          { name: { contains: validated.query } },
        ],
        isSuspended: false,
      },
      take: validated.limit,
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        bio: true,
        isPrivate: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    return { success: true, data: users };
  } catch (error) {
    logger.error({ error }, "Failed to search users");
    return { success: false, error: "ユーザー検索に失敗しました" };
  }
}
