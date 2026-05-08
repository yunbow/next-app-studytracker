import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkPlanGate } from "@/lib/stripe/plan-gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GDPR Article 20 — Right to data portability.
 *
 * Returns the authenticated user's own content in a single structured JSON
 * document, served as an attachment download. The caller only gets their
 * own rows — there is no admin mode, and the handler refuses unauthenticated
 * requests with 401.
 *
 * What we include:
 *   - A `gdpr` metadata block identifying the article, export time, and
 *     schema version so consumers (and future us) can migrate the shape.
 *   - A user-profile subset — id / name / email / createdAt.
 *   - Every user-authored resource family: study sessions, goals, habits,
 *     habit logs, reminders, comments, reactions, badges, mentor profile,
 *     study-group memberships, study-room participations.
 *
 * What we exclude:
 *   - NextAuth `Account` / `Session` rows (auth infrastructure).
 *   - `StudyGroup` rows the user didn't create (they belong to other
 *     members / the group creator).
 *
 * Cap per-model at 5000 rows. Larger exports should be chunked / async.
 */
const MAX_ROWS_PER_MODEL = 5000;
const SCHEMA_VERSION = "1";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const planCheck = await checkPlanGate(userId, "basic");
  if (!planCheck.allowed) {
    return Response.json({ error: planCheck.error }, { status: 403 });
  }

  const [
    user,
    studySessions,
    goals,
    habits,
    habitLogs,
    reminders,
    comments,
    reactions,
    userBadges,
    mentorProfile,
    studyGroupMemberships,
    studyRoomParticipations,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        createdAt: true,
      },
    }),
    prisma.studySession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: MAX_ROWS_PER_MODEL,
    }),
    prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: MAX_ROWS_PER_MODEL,
    }),
    prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: MAX_ROWS_PER_MODEL,
    }),
    prisma.habitLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: MAX_ROWS_PER_MODEL,
    }),
    prisma.reminder.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: MAX_ROWS_PER_MODEL,
    }),
    prisma.comment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: MAX_ROWS_PER_MODEL,
    }),
    prisma.reaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: MAX_ROWS_PER_MODEL,
    }),
    prisma.userBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: "desc" },
      take: MAX_ROWS_PER_MODEL,
    }),
    prisma.mentorProfile.findUnique({
      where: { userId },
    }),
    prisma.studyGroupMember.findMany({
      where: { userId },
      orderBy: { joinedAt: "desc" },
      take: MAX_ROWS_PER_MODEL,
    }),
    prisma.studyRoomParticipant.findMany({
      where: { userId },
      orderBy: { joinedAt: "desc" },
      take: MAX_ROWS_PER_MODEL,
    }),
  ]);

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const body = {
    gdpr: {
      article: "GDPR Article 20 — Right to data portability",
      exportedAt: new Date().toISOString(),
      format: "application/json",
      schemaVersion: SCHEMA_VERSION,
      app: "next-app-studytracker",
    },
    user,
    studySessions,
    goals,
    habits,
    habitLogs,
    reminders,
    comments,
    reactions,
    userBadges,
    mentorProfile,
    studyGroupMemberships,
    studyRoomParticipations,
  };

  const date = new Date().toISOString().slice(0, 10);
  const filename = `next-app-studytracker-export-${userId}-${date}.json`;

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
