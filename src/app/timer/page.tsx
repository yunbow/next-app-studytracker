import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TimerContent } from "@/features/timer/components/TimerContent";

export const metadata = { title: "タイマー | StudyTracker" };

export default async function TimerPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [activeSession, goals] = await Promise.all([
    prisma.studySession.findFirst({
      where: { userId: session.user.id, endTime: null },
      select: {
        id: true,
        startTime: true,
        subject: true,
        description: true,
        goal: { select: { id: true, title: true } },
      },
    }),
    prisma.goal.findMany({
      where: { userId: session.user.id, status: "active" },
      select: { id: true, title: true, subject: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="container max-w-2xl py-6">
      <TimerContent activeSession={activeSession} goals={goals} />
    </div>
  );
}
