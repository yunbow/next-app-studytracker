import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HomeContent } from "@/features/home/components/HomeContent";

export const metadata = { title: "ホーム | StudyTracker" };

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const [
    todaySessions,
    weekSessions,
    activeGoals,
    activeTimer,
    recentSessions,
  ] = await Promise.all([
    prisma.studySession.findMany({
      where: {
        userId: session.user.id,
        startTime: { gte: todayStart },
        endTime: { not: null },
      },
      select: { duration: true },
    }),
    prisma.studySession.findMany({
      where: {
        userId: session.user.id,
        startTime: { gte: weekStart },
        endTime: { not: null },
      },
      select: { duration: true },
    }),
    prisma.goal.findMany({
      where: { userId: session.user.id, status: "active" },
      select: {
        id: true,
        title: true,
        targetHours: true,
        deadline: true,
        subject: true,
        studySessions: {
          where: { endTime: { not: null } },
          select: { duration: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.studySession.findFirst({
      where: { userId: session.user.id, endTime: null },
      select: { id: true, startTime: true, subject: true },
    }),
    prisma.studySession.findMany({
      where: { userId: session.user.id, endTime: { not: null } },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        duration: true,
        subject: true,
      },
      orderBy: { startTime: "desc" },
      take: 5,
    }),
  ]);

  const todayMinutes = todaySessions.reduce(
    (sum, s) => sum + Math.floor((s.duration || 0) / 60),
    0
  );
  const weekMinutes = weekSessions.reduce(
    (sum, s) => sum + Math.floor((s.duration || 0) / 60),
    0
  );

  const goalsWithProgress = activeGoals.map((g) => {
    const totalMinutes = g.studySessions.reduce(
      (sum, s) => sum + Math.floor((s.duration || 0) / 60),
      0
    );
    const currentHours = Math.floor(totalMinutes / 60);
    return {
      id: g.id,
      title: g.title,
      targetHours: g.targetHours,
      currentHours,
      deadline: g.deadline,
      subject: g.subject,
    };
  });

  return (
    <div className="container max-w-4xl py-6">
      <HomeContent
        userName={session.user.name || ""}
        todayMinutes={todayMinutes}
        weekMinutes={weekMinutes}
        totalSessions={weekSessions.length}
        activeGoals={goalsWithProgress}
        activeTimer={activeTimer}
        recentSessions={recentSessions.map((s) => ({
          ...s,
          endTime: s.endTime!,
        }))}
      />
    </div>
  );
}
