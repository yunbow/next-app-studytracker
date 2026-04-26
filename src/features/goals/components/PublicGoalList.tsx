import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

type PublicGoal = {
  id: string;
  title: string;
  description: string | null;
  targetHours: number | null;
  currentHours: number;
  deadline: Date | null;
  subject: string | null;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
};

function getImageUrl(src: string | null): string | undefined {
  if (!src) return undefined;
  if (src.startsWith("data:") || src.startsWith("http")) return src;
  if (src.startsWith("/uploads/")) return `/api/images${src.replace("/uploads/", "/")}`;
  if (src.startsWith("uploads/")) return `/api/images/${src.replace("uploads/", "")}`;
  return src;
}

export function PublicGoalList({ goals }: { goals: PublicGoal[] }) {
  if (goals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        公開されている目標がありません
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {goals.map((g) => {
        const progress =
          g.targetHours && g.targetHours > 0
            ? Math.min(100, Math.round((g.currentHours / g.targetHours) * 100))
            : null;

        return (
          <li key={g.id}>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <Link href={`/users/${g.user.id}`} className="shrink-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={getImageUrl(g.user.image)} />
                      <AvatarFallback className="text-sm">
                        {g.user.name?.[0]?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{g.title}</p>
                        <Link
                          href={`/users/${g.user.id}`}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          {g.user.name || g.user.username || "ユーザー"}
                        </Link>
                      </div>
                      {g.subject && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                          {g.subject}
                        </span>
                      )}
                    </div>
                    {g.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {g.description}
                      </p>
                    )}
                    {progress !== null && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{g.currentHours}h / {g.targetHours}h</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {g.deadline && (
                      <p className="text-xs text-muted-foreground mt-1">
                        締切: {new Date(g.deadline).toLocaleDateString("ja-JP")}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
