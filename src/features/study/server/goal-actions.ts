"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger, logSecurityEvent } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types/action-result";
import {
  CreateGoalSchema,
  UpdateGoalSchema,
  type CreateGoalInput,
  type UpdateGoalInput,
} from "../schema/study-schema";

export async function createGoal(
  input: CreateGoalInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = CreateGoalSchema.parse(input);

    const goal = await prisma.goal.create({
      data: {
        title: validated.title,
        description: validated.description,
        targetHours: validated.targetHours,
        deadline: validated.deadline ? new Date(validated.deadline) : null,
        subject: validated.subject,
        tags: validated.tags,
        userId: session.user.id,
      },
    });

    logger.info({ goalId: goal.id, userId: session.user.id }, "Goal created");
    revalidatePath("/goals");

    return { success: true, data: { id: goal.id } };
  } catch (error) {
    logger.error({ error }, "Failed to create goal");
    return { success: false, error: "Failed to create goal" };
  }
}

export async function updateGoal(input: UpdateGoalInput): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = UpdateGoalSchema.parse(input);

    const goal = await prisma.goal.findUnique({
      where: { id: validated.id },
      select: { userId: true },
    });

    if (!goal) {
      return { success: false, error: "Goal not found" };
    }

    if (goal.userId !== session.user.id) {
      logSecurityEvent("IDOR_ATTEMPT", {
        userId: session.user.id,
        goalId: validated.id,
        action: "update_goal",
      });
      return { success: false, error: "Forbidden" };
    }

    await prisma.goal.update({
      where: { id: validated.id },
      data: {
        ...(validated.title && { title: validated.title }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.targetHours !== undefined && { targetHours: validated.targetHours }),
        ...(validated.deadline !== undefined && {
          deadline: validated.deadline ? new Date(validated.deadline) : null,
        }),
        ...(validated.status && { status: validated.status }),
        ...(validated.subject !== undefined && { subject: validated.subject }),
        ...(validated.tags !== undefined && { tags: validated.tags }),
      },
    });

    logger.info({ goalId: validated.id, userId: session.user.id }, "Goal updated");
    revalidatePath("/goals");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to update goal");
    return { success: false, error: "Failed to update goal" };
  }
}

export async function deleteGoal(id: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const goal = await prisma.goal.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!goal) {
      return { success: false, error: "Goal not found" };
    }

    if (goal.userId !== session.user.id) {
      logSecurityEvent("IDOR_ATTEMPT", {
        userId: session.user.id,
        goalId: id,
        action: "delete_goal",
      });
      return { success: false, error: "Forbidden" };
    }

    await prisma.goal.delete({ where: { id } });

    logger.info({ goalId: id, userId: session.user.id }, "Goal deleted");
    revalidatePath("/goals");

    return { success: true, data: undefined };
  } catch (error) {
    logger.error({ error }, "Failed to delete goal");
    return { success: false, error: "Failed to delete goal" };
  }
}
