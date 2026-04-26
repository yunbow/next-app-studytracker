import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileContent } from "@/features/user/components/ProfileContent";
import { sessionVisibilityWhereForViewer } from "@/features/study/server/visibility-helpers";

export const metadata = { title: "プロフィール" };

const PAGE_SIZE = 20;

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const currentPage = Math.max(1, Number(pageParam) || 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      email: true,
      createdAt: true,
      isPrivate: true,
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });
  if (!user) notFound();

  const isOwnProfile = session.user.id === user.id;

  const [followRelation, followRequest] = isOwnProfile
    ? [null, null]
    : await Promise.all([
        prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: session.user.id,
              followingId: id,
            },
          },
          select: { id: true },
        }),
        prisma.followRequest.findUnique({
          where: {
            senderId_receiverId: {
              senderId: session.user.id,
              receiverId: id,
            },
          },
          select: { id: true },
        }),
      ]);

  // このプロフィール所有者のセッションのうち、visibility ルール上 viewer が閲覧可能なものだけ取得。
  // sessionVisibilityWhereForViewer が public / followers / 自分自身を一元的にフィルタするため、
  // visibility=public セッションが「誰からも見える」という仕様がここで初めて実効化する
  // （旧実装ではタイムラインがフォロー絞り込みの内側に public を閉じ込めており観測点がなかった）。
  const viewerWhere = await sessionVisibilityWhereForViewer(session.user.id);
  const sessionsWhere = {
    AND: [
      { userId: user.id },
      { endTime: { not: null } },
      viewerWhere,
    ],
  };
  const [studySessions, sessionsTotal] = await Promise.all([
    prisma.studySession.findMany({
      where: sessionsWhere,
      orderBy: { startTime: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        startTime: true,
        endTime: true,
        duration: true,
        subject: true,
        description: true,
        visibility: true,
      },
    }),
    prisma.studySession.count({ where: sessionsWhere }),
  ]);
  const totalPages = Math.ceil(sessionsTotal / PAGE_SIZE);

  return (
    <div className="w-full max-w-2xl pb-8">
      <ProfileContent
        user={user}
        isOwnProfile={isOwnProfile}
        isFollowing={!!followRelation}
        isFollowRequested={!!followRequest}
        studySessions={studySessions}
        sessionsPagination={{
          currentPage,
          totalPages,
          basePath: `/users/${user.id}`,
        }}
      />
    </div>
  );
}
