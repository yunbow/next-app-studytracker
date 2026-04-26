import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileEditForm } from "@/features/user/components/ProfileEditForm";
import { BackLink } from "@/components/common/BackLink";

export const metadata = { title: "プロフィール編集" };

export default async function ProfileSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, username: true, name: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="container max-w-2xl py-8">
      <BackLink href="/settings" label="設定に戻る" />
      <Card>
        <CardHeader><CardTitle className="text-2xl">プロフィール編集</CardTitle></CardHeader>
        <CardContent><ProfileEditForm user={user} /></CardContent>
      </Card>
    </div>
  );
}
