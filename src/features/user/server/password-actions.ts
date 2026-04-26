"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types/action-result";
import { ChangePasswordSchema } from "../schema/password-schema";

export async function changePasswordAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "認証が必要です" };

    const parsed = ChangePasswordSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || !user.password) return { success: false, error: "パスワードの変更に失敗しました" };

    const isValid = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!isValid) return { success: false, error: "現在のパスワードが正しくありません" };

    const hashed = await bcrypt.hash(parsed.data.newPassword, 10);
    await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } });
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "パスワードの変更に失敗しました" };
  }
}
