import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RecordsContent } from "@/features/records/components/RecordsContent";
import { PublicSessionList } from "@/features/records/components/PublicSessionList";
import { PageTabs } from "@/components/common/PageTabs";
import { Pagination } from "@/components/common/Pagination";

export const metadata = { title: "記録 | StudyTracker" };

const TABS = [
  { label: "自分の記録", value: "mine" },
  { label: "みんなの記録", value: "everyone" },
];

const PAGE_SIZE = 20;

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { tab, page: pageParam } = await searchParams;
  const activeTab = tab === "everyone" ? "everyone" : "mine";
  const currentPage = Math.max(1, Number(pageParam) || 1);
  const skip = (currentPage - 1) * PAGE_SIZE;
  const tabSearchParams = activeTab === "everyone" ? { tab: "everyone" } : {};

  if (activeTab === "everyone") {
    const where = {
      visibility: "public",
      endTime: { not: null },
      userId: { not: session.user.id },
      user: { isSuspended: false },
    } as const;
    const [publicSessions, total] = await Promise.all([
      prisma.studySession.findMany({
        where,
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
          tags: true,
          user: {
            select: { id: true, name: true, username: true, image: true },
          },
        },
      }),
      prisma.studySession.count({ where }),
    ]);
    const totalPages = Math.ceil(total / PAGE_SIZE);

    return (
      <div className="w-full max-w-4xl pb-6">
        <PageTabs tabs={TABS} basePath="/records" activeTab={activeTab} />
        <PublicSessionList
          sessions={publicSessions.map((s) => ({ ...s, endTime: s.endTime! }))}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath="/records"
          searchParams={tabSearchParams}
        />
      </div>
    );
  }

  const where = { userId: session.user.id, endTime: { not: null } } as const;
  const [sessions, total] = await Promise.all([
    prisma.studySession.findMany({
      where,
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
      skip,
      take: PAGE_SIZE,
    }),
    prisma.studySession.count({ where }),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="w-full max-w-4xl pb-6">
      <PageTabs tabs={TABS} basePath="/records" activeTab={activeTab} />
      <RecordsContent
        sessions={sessions.map((s) => ({ ...s, endTime: s.endTime! }))}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/records"
        searchParams={tabSearchParams}
      />
    </div>
  );
}
