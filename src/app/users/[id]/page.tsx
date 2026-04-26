import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileContent } from "@/features/user/components/ProfileContent";
import { sessionVisibilityWhereForViewer } from "@/features/study/server/visibility-helpers";

export const metadata = { title: "プロフィール" };

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      email: true,
      createdAt: true,
    },
  });
  if (!user) notFound();

  const isOwnProfile = session.user.id === user.id;

  // このプロフィール所有者のセッションのうち、visibility ルール上 viewer が閲覧可能なものだけ取得。
  // sessionVisibilityWhereForViewer が public / followers / 自分自身を一元的にフィルタするため、
  // visibility=public セッションが「誰からも見える」という仕様がここで初めて実効化する
  // （旧実装ではタイムラインがフォロー絞り込みの内側に public を閉じ込めており観測点がなかった）。
  const viewerWhere = await sessionVisibilityWhereForViewer(session.user.id);
  const studySessions = await prisma.studySession.findMany({
    where: {
      AND: [
        { userId: user.id },
        { endTime: { not: null } },
        viewerWhere,
      ],
    },
    orderBy: { startTime: "desc" },
    take: 20,
    select: {
      id: true,
      startTime: true,
      endTime: true,
      duration: true,
      subject: true,
      description: true,
      visibility: true,
    },
  });

  return (
    <div className="container max-w-2xl py-8">
      <ProfileContent
        user={user}
        isOwnProfile={isOwnProfile}
        studySessions={studySessions}
      />
    </div>
  );
}
