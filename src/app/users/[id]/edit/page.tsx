import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileEditForm } from "@/features/user/components/ProfileEditForm";
import { BackLink } from "@/components/common/BackLink";

export const metadata = { title: "プロフィール編集" };

export default async function UserProfileEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  if (session.user.id !== id) redirect("/settings");

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, username: true, name: true, image: true },
  });
  if (!user) notFound();

  return (
    <div className="container max-w-2xl py-8">
      <BackLink href={`/users/${id}`} label="プロフィールに戻る" />
      <ProfileEditForm user={user} />
    </div>
  );
}
