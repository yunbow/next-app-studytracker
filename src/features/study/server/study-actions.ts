"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger, logSecurityEvent } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types/action-result";
import {
  CreateStudySessionSchema,
  UpdateStudySessionSchema,
  type CreateStudySessionInput,
  type UpdateStudySessionInput,
} from "../schema/study-schema";

export async function createStudySession(
  input: CreateStudySessionInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = CreateStudySessionSchema.parse(input);

    const studySession = await prisma.studySession.create({
      data: {
        startTime: new Date(validated.startTime),
        endTime: validated.endTime ? new Date(validated.endTime) : null,
        duration: validated.duration,
        subject: validated.subject,
        description: validated.description,
        tags: validated.tags,
        visibility: validated.visibility,
        goalId: validated.goalId,
        userId: session.user.id,
      },
    });

    logger.info({ sessionId: studySession.id, userId: session.user.id }, "Study session created");
    revalidatePath("/study");

    return { success: true, data: { id: studySession.id } };
  } catch (error) {
    logger.error({ error }, "Failed to create study session");
    return { success: false, error: "Failed to create study session" };
  }
}

export async function updateStudySession(
  input: UpdateStudySessionInput
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = UpdateStudySessionSchema.parse(input);

    const studySession = await prisma.studySession.findUnique({
      where: { id: validated.id },
      select: { userId: true },
    });

    if (!studySession) {
      return { success: false, error: "Study session not found" };
    }

    if (studySession.userId !== session.user.id) {
      logSecurityEvent("IDOR_ATTEMPT", {
        userId: session.user.id,
        sessionId: validated.id,
        action: "update_study_session",
      });
      return { success: false, error: "Forbidden" };
    }

    await prisma.studySession.update({
      where: { id: validated.id },
      data: {
        ...(validated.startTime && { startTime: new Date(validated.startTime) }),
        ...(validated.endTime !== undefined && {
          endTime: validated.endTime ? new Date(validated.endTime) : null,
        }),
        ...(validated.duration !== undefined && { duration: validated.duration }),
        ...(validated.subject !== undefined && { subject: validated.subject }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.tags !== undefined && { tags: validated.tags }),
        ...(validated.visibility && { visibility: validated.visibility }),
        ...(validated.goalId !== undefined && { goalId: validated.goalId }),
      },
    });

    logger.info({ sessionId: validated.id, userId: session.user.id }, "Study session updated");
    revalidatePath("/study");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to update study session");
    return { success: false, error: "Failed to update study session" };
  }
}

export async function deleteStudySession(id: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const studySession = await prisma.studySession.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!studySession) {
      return { success: false, error: "Study session not found" };
    }

    if (studySession.userId !== session.user.id) {
      logSecurityEvent("IDOR_ATTEMPT", {
        userId: session.user.id,
        sessionId: id,
        action: "delete_study_session",
      });
      return { success: false, error: "Forbidden" };
    }

    await prisma.studySession.delete({ where: { id } });

    logger.info({ sessionId: id, userId: session.user.id }, "Study session deleted");
    revalidatePath("/study");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to delete study session");
    return { success: false, error: "Failed to delete study session" };
  }
}
