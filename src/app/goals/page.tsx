import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoalsContent } from "@/features/goals/components/GoalsContent";

export const metadata = { title: "目標 | StudyTracker" };

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

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
      createdAt: g.createdAt,
      sessionCount: g.studySessions.length,
    };
  });

  return (
    <div className="container max-w-4xl py-6">
      <GoalsContent goals={goalsWithProgress} />
    </div>
  );
}
