"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  userName: string;
  todayMinutes: number;
  weekMinutes: number;
  totalSessions: number;
  activeGoals: {
    id: string;
    title: string;
    targetHours: number | null;
    currentHours: number;
    deadline: Date | null;
    subject: string | null;
  }[];
  activeTimer: {
    id: string;
    startTime: Date;
    subject: string | null;
  } | null;
  recentSessions: {
    id: string;
    startTime: Date;
    endTime: Date;
    duration: number | null;
    subject: string | null;
  }[];
};

function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0) return `${h}時間${m > 0 ? `${m}分` : ""}`;
  return `${m}分`;
}

export function HomeContent({
  userName,
  todayMinutes,
  weekMinutes,
  totalSessions,
  activeGoals,
  activeTimer,
  recentSessions,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          おかえりなさい、{userName || "ゲスト"}さん
        </h1>
        <p className="text-muted-foreground">今日も学習を頑張りましょう</p>
      </div>

      {/* Active Timer Banner */}
      {activeTimer && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">タイマー稼働中</p>
                <p className="font-semibold">
                  {activeTimer.subject || "科目未設定"}
                </p>
              </div>
              <Link href="/timer">
                <Button>タイマーを確認</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              今日の学習
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatMinutes(todayMinutes)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              今週の学習
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatMinutes(weekMinutes)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              今週のセッション数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalSessions}回</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {!activeTimer && (
          <Link href="/timer">
            <Button>タイマーを開始</Button>
          </Link>
        )}
        <Link href="/records">
          <Button variant="outline">記録を見る</Button>
        </Link>
        <Link href="/goals">
          <Button variant="outline">目標を管理</Button>
        </Link>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">進行中の目標</h2>
          <div className="space-y-3">
            {activeGoals.map((goal) => {
              const progress =
                goal.targetHours && goal.targetHours > 0
                  ? Math.min(
                      100,
                      Math.round((goal.currentHours / goal.targetHours) * 100)
                    )
                  : 0;
              return (
                <Card key={goal.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{goal.title}</p>
                        {goal.subject && (
                          <p className="text-xs text-muted-foreground">
                            {goal.subject}
                          </p>
                        )}
                      </div>
                      {goal.targetHours && (
                        <span className="text-sm text-muted-foreground">
                          {goal.currentHours}/{goal.targetHours}h
                        </span>
                      )}
                    </div>
                    {goal.targetHours && (
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                    {goal.deadline && (
                      <p className="text-xs text-muted-foreground mt-1">
                        期限:{" "}
                        {new Date(goal.deadline).toLocaleDateString("ja-JP")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">最近の学習</h2>
          <div className="space-y-2">
            {recentSessions.map((s) => (
              <Card key={s.id}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {s.subject || "科目未設定"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.startTime).toLocaleDateString("ja-JP")}{" "}
                        {new Date(s.startTime).toLocaleTimeString("ja-JP", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      {formatMinutes(Math.floor((s.duration || 0) / 60))}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
