import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RecordsContent } from "@/features/records/components/RecordsContent";

export const metadata = { title: "記録 | StudyTracker" };

export default async function RecordsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

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
      goal: { select: { id: true, title: true } },
    },
    orderBy: { startTime: "desc" },
    take: 50,
  });

  return (
    <div className="container max-w-4xl py-6">
      <RecordsContent
        sessions={sessions.map((s) => ({ ...s, endTime: s.endTime! }))}
      />
    </div>
  );
}
