import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * StudySession の可視性判定を一元化するヘルパー。
 *
 * Why: visibility の判定ロジックが各 action（timeline 用の social-actions,
 * プロフィール用の /users/[id] 等）で個別に書かれると、`followers` の方向性や
 * `public` の扱いが場所ごとに乖離しやすい。本ファイルは唯一の判定源として、
 * Prisma の where 句を返す形でアクセス制御を集約する。
 *
 * アクセスルール:
 *  - `public`: 誰でも閲覧可
 *  - `followers`: viewer が author をフォローしている（= viewer が author の follower である）時のみ閲覧可
 *  - `private`: author 本人のみ閲覧可
 *  - author 本人は visibility に関わらず全セッション閲覧可
 *
 * `followers` の方向性（混乱しやすいポイント）:
 *  - Follow テーブル: followerId = フォローする側, followingId = フォローされる側
 *  - 「author を viewer がフォロー」= Follow(followerId=viewer, followingId=author) が存在
 *  - よって viewer が閲覧できる author の followers セッション条件は
 *    「author ∈ viewer の followingIds」であって、逆ではない
 */
export async function sessionVisibilityWhereForViewer(
  viewerId: string
): Promise<Prisma.StudySessionWhereInput> {
  // viewer がフォローしている author の ID 集合。
  // この集合の author のセッションについて viewer は「follower 扱い」で followers 可視セッションが見える。
  const follows = await prisma.follow.findMany({
    where: { followerId: viewerId },
    select: { followingId: true },
  });
  const followedAuthorIds = follows.map((f) => f.followingId);

  return {
    OR: [
      { visibility: "public" },
      { userId: viewerId },
      { visibility: "followers", userId: { in: followedAuthorIds } },
    ],
  };
}
