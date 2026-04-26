import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoalsContent } from "@/features/goals/components/GoalsContent";
import { PublicGoalList } from "@/features/goals/components/PublicGoalList";
import { PageTabs } from "@/components/common/PageTabs";
import { Pagination } from "@/components/common/Pagination";

export const metadata = { title: "目標 | StudyTracker" };

const TABS = [
  { label: "自分の目標", value: "mine" },
  { label: "みんなの目標", value: "everyone" },
];

const PAGE_SIZE = 20;

export default async function GoalsPage({
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
      userId: { not: session.user.id },
      status: "active",
      visibility: "public",
      user: { isSuspended: false },
    } as const;
    const [publicGoals, total] = await Promise.all([
      prisma.goal.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: PAGE_SIZE,
        select: {
          id: true,
          title: true,
          description: true,
          targetHours: true,
          deadline: true,
          subject: true,
          studySessions: {
            where: { endTime: { not: null } },
            select: { duration: true },
          },
          user: {
            select: { id: true, name: true, username: true, image: true },
          },
        },
      }),
      prisma.goal.count({ where }),
    ]);
    const totalPages = Math.ceil(total / PAGE_SIZE);

    const publicGoalsWithProgress = publicGoals.map((g) => {
      const totalMinutes = g.studySessions.reduce(
        (sum, s) => sum + Math.floor((s.duration || 0) / 60),
        0
      );
      return {
        id: g.id,
        title: g.title,
        description: g.description,
        targetHours: g.targetHours,
        currentHours: Math.floor(totalMinutes / 60),
        deadline: g.deadline,
        subject: g.subject,
        user: g.user,
      };
    });

    return (
      <div className="w-full max-w-4xl pb-6">
        <PageTabs tabs={TABS} basePath="/goals" activeTab={activeTab} />
        <PublicGoalList goals={publicGoalsWithProgress} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath="/goals"
          searchParams={tabSearchParams}
        />
      </div>
    );
  }

  const where = { userId: session.user.id } as const;
  const [goals, total] = await Promise.all([
    prisma.goal.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        targetHours: true,
        deadline: true,
        status: true,
        subject: true,
        tags: true,
        visibility: true,
        createdAt: true,
        studySessions: {
          where: { endTime: { not: null } },
          select: { duration: true },
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      skip,
      take: PAGE_SIZE,
    }),
    prisma.goal.count({ where }),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const goalsWithProgress = goals.map((g) => {
    const totalMinutes = g.studySessions.reduce(
      (sum, s) => sum + Math.floor((s.duration || 0) / 60),
      0
    );
    return {
      id: g.id,
      title: g.title,
      description: g.description,
      targetHours: g.targetHours,
      currentHours: Math.floor(totalMinutes / 60),
      currentMinutes: totalMinutes % 60,
      deadline: g.deadline,
      status: g.status,
      subject: g.subject,
      tags: g.tags,
      visibility: g.visibility,
      createdAt: g.createdAt,
      sessionCount: g.studySessions.length,
    };
  });

  return (
    <div className="w-full max-w-4xl pb-6">
      <PageTabs tabs={TABS} basePath="/goals" activeTab={activeTab} />
      <GoalsContent goals={goalsWithProgress} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/goals"
        searchParams={tabSearchParams}
      />
    </div>
  );
}
