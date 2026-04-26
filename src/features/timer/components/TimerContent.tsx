"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { startTimer, stopTimer } from "@/features/timer/server/timer-actions";
import { toast } from "sonner";

type Props = {
  activeSession: {
    id: string;
    startTime: Date;
    subject: string | null;
    description: string | null;
    goal: { id: string; title: string } | null;
  } | null;
  goals: { id: string; title: string; subject: string | null }[];
};

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function TimerContent({ activeSession, goals }: Props) {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(!!activeSession);
  const [sessionId, setSessionId] = useState(activeSession?.id || null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [goalId, setGoalId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Calculate initial elapsed if session is active
  useEffect(() => {
    if (activeSession) {
      const start = new Date(activeSession.startTime).getTime();
      const now = Date.now();
      setElapsed(Math.floor((now - start) / 1000));
    }
  }, [activeSession]);

  // Timer tick
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStart = useCallback(async () => {
    setIsLoading(true);
    const result = await startTimer({
      subject: subject || undefined,
      description: description || undefined,
      goalId: goalId || undefined,
    });
    setIsLoading(false);

    if (result.success) {
      setSessionId(result.data.sessionId);
      setIsRunning(true);
      setElapsed(0);
      toast.success("タイマーを開始しました");
    } else {
      toast.error(result.error);
    }
  }, [subject, description, goalId]);

  const handleStop = useCallback(async () => {
    if (!sessionId) return;
    setIsLoading(true);
    const result = await stopTimer({
      sessionId,
      visibility: "private",
    });
    setIsLoading(false);

    if (result.success) {
      setIsRunning(false);
      setSessionId(null);
      toast.success("学習を記録しました");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }, [sessionId, router]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">タイマー</h1>

      {/* Timer Display */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6">
            <div className="text-6xl font-mono font-bold tracking-wider tabular-nums">
              {formatElapsed(elapsed)}
            </div>

            {isRunning && activeSession && (
              <div className="text-center">
                {activeSession.subject && (
                  <p className="text-muted-foreground">
                    {activeSession.subject}
                  </p>
                )}
                {activeSession.goal && (
                  <p className="text-sm text-muted-foreground">
                    目標: {activeSession.goal.title}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              {!isRunning ? (
                <Button
                  size="lg"
                  onClick={handleStart}
                  disabled={isLoading}
                  className="px-8"
                >
                  {isLoading ? "開始中..." : "開始"}
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={handleStop}
                  disabled={isLoading}
                  className="px-8"
                >
                  {isLoading ? "停止中..." : "停止"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings (only when not running) */}
      {!isRunning && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">学習設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">科目</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="例: 数学、英語、プログラミング"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">メモ</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="何を勉強するか（任意）"
              />
            </div>

            {goals.length > 0 && (
              <div className="space-y-2">
                <Label>目標と紐付け</Label>
                <Select value={goalId} onValueChange={setGoalId}>
                  <SelectTrigger>
                    <SelectValue placeholder="目標を選択（任意）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">なし</SelectItem>
                    {goals.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.title}
                        {g.subject && ` (${g.subject})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
