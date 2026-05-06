import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoalsContent } from "@/features/goals/components/GoalsContent";
import { PublicGoalList } from "@/features/goals/components/PublicGoalList";
import { PageTabs } from "@/components/common/PageTabs";

export const metadata = { title: "目標 | StudyTracker" };

const TABS = [
  { label: "自分の目標", value: "mine" },
  { label: "みんなの目標", value: "everyone" },
];

export default async function GoalsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { tab } = await searchParams;
  const activeTab = tab === "everyone" ? "everyone" : "mine";

  if (activeTab === "everyone") {
    const publicGoals = await prisma.goal.findMany({
      where: {
        userId: { not: session.user.id },
        status: "active",
        visibility: "public",
        user: { isSuspended: false },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
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
    });

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
      </div>
    );
  }

  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id },
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
  });

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
    </div>
  );
}
