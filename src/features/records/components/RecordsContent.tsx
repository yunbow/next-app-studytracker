"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteStudySession } from "@/features/study/server/study-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Session = {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number | null;
  subject: string | null;
  description: string | null;
  tags: string | null;
  visibility: string;
  goal: { id: string; title: string } | null;
};

function VisibilityBadge({ visibility }: { visibility: string }) {
  if (visibility === "public") {
    return (
      <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        公開
      </span>
    );
  }
  if (visibility === "followers") {
    return (
      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        フォロワー
      </span>
    );
  }
  return (
    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
      非公開
    </span>
  );
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}時間${m > 0 ? `${m}分` : ""}`;
  return `${m}分`;
}

export function RecordsContent({ sessions }: { sessions: Session[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = sessions.filter((s) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      s.subject?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.tags?.toLowerCase().includes(q) ||
      s.goal?.title.toLowerCase().includes(q)
    );
  });

  // Group by date
  const grouped: Record<string, Session[]> = {};
  filtered.forEach((s) => {
    const date = new Date(s.startTime).toLocaleDateString("ja-JP");
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(s);
  });

  const totalMinutes = filtered.reduce(
    (sum, s) => sum + Math.floor((s.duration || 0) / 60),
    0
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteStudySession(deleteTarget);
    setIsDeleting(false);
    setDeleteTarget(null);
    if (result.success) {
      toast.success("記録を削除しました");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">学習記録</h1>
        <p className="text-sm text-muted-foreground">
          合計: {Math.floor(totalMinutes / 60)}時間{totalMinutes % 60}分（
          {filtered.length}件）
        </p>
      </div>

      <Input
        placeholder="科目、メモ、タグで検索..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      {Object.keys(grouped).length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            {filter ? "検索結果がありません" : "学習記録がまだありません。タイマーで学習を始めましょう。"}
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([date, dateSessions]) => {
          const dayMinutes = dateSessions.reduce(
            (sum, s) => sum + Math.floor((s.duration || 0) / 60),
            0
          );
          return (
            <div key={date}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  {date}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {formatDuration(dayMinutes * 60)}
                </span>
              </div>
              <div className="space-y-2">
                {dateSessions.map((s) => (
                  <Card key={s.id}>
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm truncate">
                              {s.subject || "科目未設定"}
                            </p>
                            <VisibilityBadge visibility={s.visibility} />
                            {s.goal && (
                              <span className="text-xs bg-muted px-2 py-0.5 rounded">
                                {s.goal.title}
                              </span>
                            )}
                          </div>
                          {s.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {s.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(s.startTime).toLocaleTimeString("ja-JP", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            -{" "}
                            {new Date(s.endTime).toLocaleTimeString("ja-JP", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {s.tags && (
                            <div className="flex gap-1 mt-1">
                              {s.tags.split(",").map((tag, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded"
                                >
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <span className="text-sm font-medium whitespace-nowrap">
                            {formatDuration(s.duration || 0)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive h-7 px-2"
                            onClick={() => setDeleteTarget(s.id)}
                          >
                            削除
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>記録を削除</DialogTitle>
            <DialogDescription>
              この学習記録を削除しますか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "削除中..." : "削除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
