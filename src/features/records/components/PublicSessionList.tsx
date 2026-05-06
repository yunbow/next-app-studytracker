import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

type PublicSession = {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number | null;
  subject: string | null;
  description: string | null;
  tags: string | null;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "-";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}時間${m}分` : `${m}分`;
}

function getImageUrl(src: string | null): string | undefined {
  if (!src) return undefined;
  if (src.startsWith("data:") || src.startsWith("http")) return src;
  if (src.startsWith("/uploads/")) return `/api/images${src.replace("/uploads/", "/")}`;
  if (src.startsWith("uploads/")) return `/api/images/${src.replace("uploads/", "")}`;
  return src;
}

export function PublicSessionList({ sessions }: { sessions: PublicSession[] }) {
  if (sessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        公開されている学習記録がありません
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {sessions.map((s) => (
        <li key={s.id}>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <Link href={`/users/${s.user.id}`} className="shrink-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={getImageUrl(s.user.image)} />
                    <AvatarFallback className="text-sm">
                      {s.user.name?.[0]?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {s.subject || "無題"}
                      </p>
                      <Link
                        href={`/users/${s.user.id}`}
                        className="text-xs text-muted-foreground hover:underline"
                      >
                        {s.user.name || s.user.username || "ユーザー"}
                      </Link>
                    </div>
                    <span className="text-sm font-semibold shrink-0">
                      {formatDuration(s.duration)}
                    </span>
                  </div>
                  {s.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {s.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(s.startTime).toLocaleDateString("ja-JP")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
