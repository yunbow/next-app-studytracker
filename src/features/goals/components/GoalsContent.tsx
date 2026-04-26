"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createGoal,
  updateGoal,
  deleteGoal,
} from "@/features/study/server/goal-actions";
import { toast } from "sonner";

type Goal = {
  id: string;
  title: string;
  description: string | null;
  targetHours: number | null;
  currentHours: number;
  currentMinutes: number;
  deadline: Date | null;
  status: string;
  subject: string | null;
  tags: string | null;
  createdAt: Date;
  sessionCount: number;
};

export function GoalsContent({ goals }: { goals: Goal[] }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Create form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetHours, setTargetHours] = useState("");
  const [subject, setSubject] = useState("");
  const [deadline, setDeadline] = useState("");

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");
  const archivedGoals = goals.filter((g) => g.status === "archived");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await createGoal({
      title,
      description: description || undefined,
      targetHours: targetHours ? parseInt(targetHours) : undefined,
      subject: subject || undefined,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
    });
    setIsLoading(false);

    if (result.success) {
      toast.success("目標を作成しました");
      setShowCreate(false);
      setTitle("");
      setDescription("");
      setTargetHours("");
      setSubject("");
      setDeadline("");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const result = await updateGoal({ id, status: status as "active" | "completed" | "archived" });
    if (result.success) {
      toast.success(
        status === "completed"
          ? "目標を達成しました！"
          : status === "archived"
            ? "目標をアーカイブしました"
            : "目標を再開しました"
      );
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsLoading(true);
    const result = await deleteGoal(deleteTarget);
    setIsLoading(false);
    setDeleteTarget(null);
    if (result.success) {
      toast.success("目標を削除しました");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const renderGoalCard = (goal: Goal) => {
    const progress =
      goal.targetHours && goal.targetHours > 0
        ? Math.min(100, Math.round((goal.currentHours / goal.targetHours) * 100))
        : null;

    return (
      <Card key={goal.id}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{goal.title}</p>
              {goal.subject && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded">
                  {goal.subject}
                </span>
              )}
              {goal.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {goal.description}
                </p>
              )}
            </div>
            <div className="flex gap-1 ml-2">
              {goal.status === "active" && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => handleStatusChange(goal.id, "completed")}
                  >
                    達成
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => handleStatusChange(goal.id, "archived")}
                  >
                    保留
                  </Button>
                </>
              )}
              {goal.status !== "active" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => handleStatusChange(goal.id, "active")}
                >
                  再開
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(goal.id)}
              >
                削除
              </Button>
            </div>
          </div>

          {/* Progress */}
          {goal.targetHours && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">
                  {goal.currentHours}時間
                  {goal.currentMinutes > 0 && `${goal.currentMinutes}分`} /{" "}
                  {goal.targetHours}時間
                </span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>{goal.sessionCount}セッション</span>
            {goal.deadline && (
              <span>
                期限: {new Date(goal.deadline).toLocaleDateString("ja-JP")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">目標</h1>
        <Button onClick={() => setShowCreate(true)}>新規作成</Button>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            進行中（{activeGoals.length}）
          </h2>
          <div className="space-y-3">{activeGoals.map(renderGoalCard)}</div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            達成済み（{completedGoals.length}）
          </h2>
          <div className="space-y-3">{completedGoals.map(renderGoalCard)}</div>
        </div>
      )}

      {/* Archived Goals */}
      {archivedGoals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            保留中（{archivedGoals.length}）
          </h2>
          <div className="space-y-3">{archivedGoals.map(renderGoalCard)}</div>
        </div>
      )}

      {goals.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            目標がまだありません。「新規作成」から目標を設定しましょう。
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>目標を作成</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal-title">タイトル *</Label>
              <Input
                id="goal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: TOEIC 800点を取る"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-subject">科目</Label>
              <Input
                id="goal-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="例: 英語"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-description">説明</Label>
              <Input
                id="goal-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="目標の詳細（任意）"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal-hours">目標時間（時間）</Label>
                <Input
                  id="goal-hours"
                  type="number"
                  min="1"
                  value={targetHours}
                  onChange={(e) => setTargetHours(e.target.value)}
                  placeholder="例: 100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-deadline">期限</Label>
                <Input
                  id="goal-deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreate(false)}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isLoading || !title}>
                {isLoading ? "作成中..." : "作成"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>目標を削除</DialogTitle>
            <DialogDescription>
              この目標を削除しますか？紐付いた学習記録は削除されません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "削除中..." : "削除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
