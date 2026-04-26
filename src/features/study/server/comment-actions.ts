"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger, logSecurityEvent } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types/action-result";
import {
  CreateCommentSchema,
  type CreateCommentInput,
} from "../schema/study-schema";

export async function createComment(
  input: CreateCommentInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = CreateCommentSchema.parse(input);

    const studySession = await prisma.studySession.findUnique({
      where: { id: validated.sessionId },
      select: { id: true },
    });

    if (!studySession) {
      return { success: false, error: "Study session not found" };
    }

    const comment = await prisma.comment.create({
      data: {
        content: validated.content,
        sessionId: validated.sessionId,
        userId: session.user.id,
      },
    });

    logger.info({ commentId: comment.id, userId: session.user.id }, "Comment created");
    revalidatePath(`/study/${validated.sessionId}`);

    return { success: true, data: { id: comment.id } };
  } catch (error) {
    logger.error({ error }, "Failed to create comment");
    return { success: false, error: "Failed to create comment" };
  }
}

export async function deleteComment(id: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { userId: true, sessionId: true },
    });

    if (!comment) {
      return { success: false, error: "Comment not found" };
    }

    if (comment.userId !== session.user.id) {
      logSecurityEvent("IDOR_ATTEMPT", {
        userId: session.user.id,
        commentId: id,
        action: "delete_comment",
      });
      return { success: false, error: "Forbidden" };
    }

    await prisma.comment.delete({ where: { id } });

    logger.info({ commentId: id, userId: session.user.id }, "Comment deleted");
    revalidatePath(`/study/${comment.sessionId}`);

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to delete comment");
    return { success: false, error: "Failed to delete comment" };
  }
}
