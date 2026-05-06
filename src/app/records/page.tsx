import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RecordsContent } from "@/features/records/components/RecordsContent";
import { PublicSessionList } from "@/features/records/components/PublicSessionList";
import { PageTabs } from "@/components/common/PageTabs";

export const metadata = { title: "記録 | StudyTracker" };

const TABS = [
  { label: "自分の記録", value: "mine" },
  { label: "みんなの記録", value: "everyone" },
];

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { tab } = await searchParams;
  const activeTab = tab === "everyone" ? "everyone" : "mine";

  if (activeTab === "everyone") {
    const publicSessions = await prisma.studySession.findMany({
      where: {
        visibility: "public",
        endTime: { not: null },
        userId: { not: session.user.id },
        user: { isSuspended: false },
      },
      orderBy: { startTime: "desc" },
      take: 50,
      select: {
        id: true,
        startTime: true,
        endTime: true,
        duration: true,
        subject: true,
        description: true,
        tags: true,
        user: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
    });

    return (
      <div className="w-full max-w-4xl pb-6">
        <PageTabs tabs={TABS} basePath="/records" activeTab={activeTab} />
        <PublicSessionList
          sessions={publicSessions.map((s) => ({ ...s, endTime: s.endTime! }))}
        />
      </div>
    );
  }

  const sessions = await prisma.studySession.findMany({
    where: { userId: session.user.id, endTime: { not: null } },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      duration: true,
      subject: true,
      description: true,
      tags: true,
      visibility: true,
      goal: { select: { id: true, title: true } },
    },
    orderBy: { startTime: "desc" },
    take: 50,
  });

  return (
    <div className="w-full max-w-4xl pb-6">
      <PageTabs tabs={TABS} basePath="/records" activeTab={activeTab} />
      <RecordsContent
        sessions={sessions.map((s) => ({ ...s, endTime: s.endTime! }))}
      />
    </div>
  );
}
