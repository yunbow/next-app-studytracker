"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types/action-result";

export async function deleteAccountAction(): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "認証が必要です" };
    await prisma.user.delete({ where: { id: session.user.id } });
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "アカウントの削除に失敗しました" };
  }
}
