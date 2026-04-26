"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger, logSecurityEvent } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types/action-result";
import {
  CreateReactionSchema,
  type CreateReactionInput,
} from "../schema/study-schema";

export async function createReaction(
  input: CreateReactionInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = CreateReactionSchema.parse(input);

    const studySession = await prisma.studySession.findUnique({
      where: { id: validated.sessionId },
      select: { id: true },
    });

    if (!studySession) {
      return { success: false, error: "Study session not found" };
    }

    const reaction = await prisma.reaction.create({
      data: {
        type: validated.type,
        sessionId: validated.sessionId,
        userId: session.user.id,
      },
    });

    logger.info({ reactionId: reaction.id, userId: session.user.id }, "Reaction created");
    revalidatePath(`/study/${validated.sessionId}`);

    return { success: true, data: { id: reaction.id } };
  } catch (error) {
    logger.error({ error }, "Failed to create reaction");
    return { success: false, error: "Failed to create reaction" };
  }
}

export async function deleteReaction(id: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const reaction = await prisma.reaction.findUnique({
      where: { id },
      select: { userId: true, sessionId: true },
    });

    if (!reaction) {
      return { success: false, error: "Reaction not found" };
    }

    if (reaction.userId !== session.user.id) {
      logSecurityEvent("IDOR_ATTEMPT", {
        userId: session.user.id,
        reactionId: id,
        action: "delete_reaction",
      });
      return { success: false, error: "Forbidden" };
    }

    await prisma.reaction.delete({ where: { id } });

    logger.info({ reactionId: id, userId: session.user.id }, "Reaction deleted");
    revalidatePath(`/study/${reaction.sessionId}`);

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to delete reaction");
    return { success: false, error: "Failed to delete reaction" };
  }
}
