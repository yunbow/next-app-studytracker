"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger, logSecurityEvent } from "@/lib/logger";
import type { ActionResult } from "@/lib/types/action-result";
import { revalidatePath } from "next/cache";
import {
  CreateMentorProfileSchema,
  UpdateMentorProfileSchema,
  CreateMentoringSessionSchema,
  UpdateSessionStatusSchema,
  CreateMentorReviewSchema,
  SearchMentorsSchema,
  type CreateMentorProfileInput,
  type UpdateMentorProfileInput,
  type CreateMentoringSessionInput,
  type UpdateSessionStatusInput,
  type CreateMentorReviewInput,
  type SearchMentorsInput,
} from "../schema/mentor-schema";

/**
 * メンタープロフィールを作成
 */
export async function createMentorProfile(
  input: CreateMentorProfileInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = CreateMentorProfileSchema.parse(input);

    // 既にプロフィールがあるかチェック
    const existing = await prisma.mentorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (existing) {
      return { success: false, error: "既にメンタープロフィールが存在します" };
    }

    const profile = await prisma.mentorProfile.create({
      data: {
        ...validated,
        userId: session.user.id,
      },
    });

    logger.info({ profileId: profile.id, userId: session.user.id }, "Mentor profile created");
    revalidatePath("/mentor");

    return { success: true, data: { id: profile.id } };
  } catch (error) {
    logger.error({ error }, "Failed to create mentor profile");
    return { success: false, error: "メンタープロフィールの作成に失敗しました" };
  }
}

/**
 * メンタープロフィールを更新
 */
export async function updateMentorProfile(
  input: UpdateMentorProfileInput
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = UpdateMentorProfileSchema.parse(input);

    const profile = await prisma.mentorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return { success: false, error: "メンタープロフィールが見つかりません" };
    }

    await prisma.mentorProfile.update({
      where: { userId: session.user.id },
      data: {
        ...(validated.bio !== undefined && { bio: validated.bio }),
        ...(validated.expertise && { expertise: validated.expertise }),
        ...(validated.experience !== undefined && { experience: validated.experience }),
        ...(validated.availability !== undefined && { availability: validated.availability }),
        ...(validated.hourlyRate !== undefined && { hourlyRate: validated.hourlyRate }),
        ...(validated.isActive !== undefined && { isActive: validated.isActive }),
      },
    });

    logger.info({ userId: session.user.id }, "Mentor profile updated");
    revalidatePath("/mentor");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to update mentor profile");
    return { success: false, error: "メンタープロフィールの更新に失敗しました" };
  }
}

/**
 * メンタリングセッションを作成
 */
export async function createMentoringSession(
  input: CreateMentoringSessionInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = CreateMentoringSessionSchema.parse(input);

    // メンタープロフィールを取得
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId: validated.mentorId },
    });

    if (!mentorProfile) {
      return { success: false, error: "メンターが見つかりません" };
    }

    if (!mentorProfile.isActive) {
      return { success: false, error: "このメンターは現在対応していません" };
    }

    // 自分自身をメンターにできない
    if (validated.mentorId === session.user.id) {
      return { success: false, error: "自分自身をメンターにできません" };
    }

    const mentoringSession = await prisma.mentoringSession.create({
      data: {
        ...validated,
        scheduledAt: new Date(validated.scheduledAt),
        menteeId: session.user.id,
        mentorProfileId: mentorProfile.id,
      },
    });

    // 通知を作成
    await prisma.notification.create({
      data: {
        type: "mentoring_request",
        recipientId: validated.mentorId,
        actorId: session.user.id,
      },
    });

    logger.info(
      { sessionId: mentoringSession.id, mentorId: validated.mentorId, menteeId: session.user.id },
      "Mentoring session created"
    );
    revalidatePath("/mentor");

    return { success: true, data: { id: mentoringSession.id } };
  } catch (error) {
    logger.error({ error }, "Failed to create mentoring session");
    return { success: false, error: "メンタリングセッションの作成に失敗しました" };
  }
}

/**
 * セッションステータスを更新
 */
export async function updateSessionStatus(
  input: UpdateSessionStatusInput
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = UpdateSessionStatusSchema.parse(input);

    const mentoringSession = await prisma.mentoringSession.findUnique({
      where: { id: validated.sessionId },
      select: { mentorId: true, menteeId: true },
    });

    if (!mentoringSession) {
      return { success: false, error: "セッションが見つかりません" };
    }

    // メンターまたはメンティーのみ更新可能
    if (
      mentoringSession.mentorId !== session.user.id &&
      mentoringSession.menteeId !== session.user.id
    ) {
      logSecurityEvent("IDOR_ATTEMPT", {
        userId: session.user.id,
        sessionId: validated.sessionId,
        action: "update_session_status",
      });
      return { success: false, error: "このセッションを更新する権限がありません" };
    }

    await prisma.mentoringSession.update({
      where: { id: validated.sessionId },
      data: {
        status: validated.status,
        ...(validated.notes && { notes: validated.notes }),
      },
    });

    // ステータス変更通知。mentor/mentee の一方が退会済みで null の場合は通知不要。
    // MentoringSession は SetNull に変更済みのため、mentorId/menteeId は null の可能性あり。
    const recipientId =
      session.user.id === mentoringSession.mentorId
        ? mentoringSession.menteeId
        : mentoringSession.mentorId;

    if (recipientId) {
      await prisma.notification.create({
        data: {
          type: "mentoring_status_update",
          recipientId,
          actorId: session.user.id,
        },
      });
    }

    logger.info(
      { sessionId: validated.sessionId, status: validated.status },
      "Session status updated"
    );
    revalidatePath("/mentor");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to update session status");
    return { success: false, error: "セッションステータスの更新に失敗しました" };
  }
}

/**
 * メンターレビューを作成
 */
export async function createMentorReview(
  input: CreateMentorReviewInput
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = CreateMentorReviewSchema.parse(input);

    const mentoringSession = await prisma.mentoringSession.findUnique({
      where: { id: validated.sessionId },
      select: {
        mentorId: true,
        menteeId: true,
        status: true,
        review: true,
      },
    });

    if (!mentoringSession) {
      return { success: false, error: "セッションが見つかりません" };
    }

    // メンティーのみレビュー可能
    if (mentoringSession.menteeId !== session.user.id) {
      logSecurityEvent("IDOR_ATTEMPT", {
        userId: session.user.id,
        sessionId: validated.sessionId,
        action: "create_mentor_review",
      });
      return { success: false, error: "このセッションをレビューする権限がありません" };
    }

    // 完了したセッションのみレビュー可能
    if (mentoringSession.status !== "completed") {
      return { success: false, error: "完了したセッションのみレビューできます" };
    }

    // 既にレビュー済みかチェック
    if (mentoringSession.review) {
      return { success: false, error: "既にレビュー済みです" };
    }

    // mentorId が null（メンター退会済みセッション）の場合はレビュー不可。
    // MentoringSession.mentorId が SetNull に変更されたため事前ガードが必要。
    if (!mentoringSession.mentorId) {
      return { success: false, error: "メンターが退会済みのためレビューできません" };
    }
    const mentorIdForReview = mentoringSession.mentorId;

    await prisma.mentorReview.create({
      data: {
        ...validated,
        reviewerId: session.user.id,
        mentorId: mentorIdForReview,
      },
    });

    // メンタープロフィールの評価を更新
    const reviews = await prisma.mentorReview.findMany({
      where: { mentorId: mentorIdForReview },
      select: { rating: true },
    });

    const avgRating =
      reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length;

    await prisma.mentorProfile.update({
      where: { userId: mentorIdForReview },
      data: {
        rating: avgRating,
        totalReviews: reviews.length,
      },
    });

    // 通知を作成
    await prisma.notification.create({
      data: {
        type: "mentor_review",
        recipientId: mentorIdForReview,
        actorId: session.user.id,
      },
    });

    logger.info(
      { sessionId: validated.sessionId, rating: validated.rating },
      "Mentor review created"
    );
    revalidatePath("/mentor");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to create mentor review");
    return { success: false, error: "レビューの作成に失敗しました" };
  }
}

/**
 * メンターを検索
 */
export async function searchMentors(
  input: SearchMentorsInput
): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const validated = SearchMentorsSchema.parse(input);

    const mentors = await prisma.mentorProfile.findMany({
      where: {
        isActive: true,
        ...(validated.subject && {
          expertise: { contains: validated.subject },
        }),
        ...(validated.minRating && {
          rating: { gte: validated.minRating },
        }),
      },
      take: validated.limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            bio: true,
          },
        },
      },
      orderBy: { rating: "desc" },
    });

    return { success: true, data: mentors };
  } catch (error) {
    logger.error({ error }, "Failed to search mentors");
    return { success: false, error: "メンター検索に失敗しました" };
  }
}

/**
 * ユーザーのメンタリングセッション一覧を取得
 */
export async function getUserMentoringSessions(): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const sessions = await prisma.mentoringSession.findMany({
      where: {
        OR: [
          { mentorId: session.user.id },
          { menteeId: session.user.id },
        ],
      },
      include: {
        mentor: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
        mentee: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
        review: true,
      },
      orderBy: { scheduledAt: "desc" },
    });

    return { success: true, data: sessions };
  } catch (error) {
    logger.error({ error }, "Failed to get user mentoring sessions");
    return { success: false, error: "セッション一覧の取得に失敗しました" };
  }
}

/**
 * メンタープロフィールを取得
 */
export async function getMentorProfile(userId?: string): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "認証が必要です" };
    }

    const targetUserId = userId || session.user.id;

    const profile = await prisma.mentorProfile.findUnique({
      where: { userId: targetUserId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            bio: true,
          },
        },
      },
    });

    return { success: true, data: profile };
  } catch (error) {
    logger.error({ error }, "Failed to get mentor profile");
    return { success: false, error: "メンタープロフィールの取得に失敗しました" };
  }
}
