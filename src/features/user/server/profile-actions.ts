"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateProfileSchema = z.object({
  name: z.string().min(1, "ユーザー名は必須です").max(50, "ユーザー名は50文字以内で入力してください"),
  username: z
    .string()
    .min(3, "ユーザーIDは3文字以上である必要があります")
    .max(30, "ユーザーIDは30文字以内で入力してください")
    .regex(/^[a-zA-Z0-9_-]+$/, "ユーザーIDは英数字、ハイフン、アンダースコアのみ使用できます"),
});

export type UpdateProfileResult =
  | { success: true }
  | { success: false; error: string };

export async function updateProfileAction(input: {
  name: string;
  username: string;
}): Promise<UpdateProfileResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "認証が必要です" };
  }

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { username: parsed.data.username },
      select: { id: true },
    });
    if (existing && existing.id !== session.user.id) {
      return { success: false, error: "このユーザーIDは既に使用されています" };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        username: parsed.data.username,
      },
    });

    revalidatePath(`/users/${session.user.id}`);
    revalidatePath("/settings");
    return { success: true };
  } catch {
    return { success: false, error: "プロフィールの更新に失敗しました" };
  }
}

export async function updateProfileImageAction(
  imageUrl: string
): Promise<UpdateProfileResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "認証が必要です" };
  }

  if (!imageUrl || typeof imageUrl !== "string") {
    return { success: false, error: "画像URLが無効です" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    revalidatePath(`/users/${session.user.id}`);
    return { success: true };
  } catch {
    return { success: false, error: "プロフィール画像の更新に失敗しました" };
  }
}
