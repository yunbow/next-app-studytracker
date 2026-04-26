import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackLink } from "@/components/common/BackLink";
import { format } from "date-fns";
import { Monitor, Clock } from "lucide-react";

export const metadata = { title: "ログイン履歴" };

export default async function LoginHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sessions = await prisma.session.findMany({
    where: { userId: session.user.id },
    orderBy: { expires: "desc" },
    take: 50,
    select: { id: true, expires: true },
  });

  return (
    <div className="container max-w-2xl py-6">
      <BackLink href="/settings" label="設定に戻る" />
      <h1 className="text-2xl font-bold mb-6">ログイン履歴</h1>
      <Card>
        <CardHeader><CardTitle>最近のログイン</CardTitle></CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-muted-foreground">ログイン履歴はありません</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-start gap-3 py-3 border-b last:border-b-0">
                  <div className="mt-0.5 text-muted-foreground"><Monitor className="h-5 w-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">セッション</div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />有効期限: {format(s.expires, "yyyy/MM/dd HH:mm")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
