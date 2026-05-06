"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "@/lib/i18n";
import { FollowButton } from "./FollowButton";

type StudySessionSummary = {
  id: string;
  startTime: Date;
  endTime: Date | null;
  duration: number | null;
  subject: string | null;
  description: string | null;
  visibility: string;
};

type ProfileContentProps = {
  user: {
    id: string;
    username: string | null;
    name: string | null;
    image: string | null;
    email: string;
    createdAt: Date;
    isPrivate: boolean;
    _count: {
      followers: number;
      following: number;
    };
  };
  isOwnProfile: boolean;
  isFollowing: boolean;
  isFollowRequested: boolean;
  studySessions?: StudySessionSummary[];
};

const visibilityLabels: Record<string, string> = {
  public: "公開",
  followers: "フォロワー",
  private: "非公開",
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "-";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}時間${minutes}分`;
  return `${minutes}分`;
}

function getImageUrl(src: string | null): string | undefined {
  if (!src) return undefined;
  if (src.startsWith("data:") || src.startsWith("http")) return src;
  if (src.startsWith("/uploads/")) return `/api/images${src.replace("/uploads/", "/")}`;
  if (src.startsWith("uploads/")) return `/api/images/${src.replace("uploads/", "")}`;
  return src;
}

export function ProfileContent({
  user,
  isOwnProfile,
  isFollowing,
  isFollowRequested,
  studySessions = [],
}: ProfileContentProps) {
  const { t } = useTranslations();

  const displayName = user.name || t.common.nameNotSet;
  const joinDate = new Date(user.createdAt).toLocaleDateString();

  const followStatus = isFollowing ? "following" : isFollowRequested ? "requested" : "none";

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="h-20 w-20 border-4 border-background">
              <AvatarImage src={getImageUrl(user.image)} />
              <AvatarFallback className="text-2xl">
                {user.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">{displayName}</h1>
              {user.username && (
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {t.profile.registeredAt}{joinDate}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span>
                  <span className="font-semibold">{user._count.followers}</span>
                  <span className="text-muted-foreground ml-1">フォロワー</span>
                </span>
                <span>
                  <span className="font-semibold">{user._count.following}</span>
                  <span className="text-muted-foreground ml-1">フォロー中</span>
                </span>
              </div>
            </div>
            <div className="shrink-0">
              {isOwnProfile ? (
                <Link href={`/users/${user.id}/edit`}>
                  <Button variant="outline" size="sm">{t.profile.editProfile}</Button>
                </Link>
              ) : (
                <FollowButton
                  targetUserId={user.id}
                  initialStatus={followStatus}
                  isPrivate={user.isPrivate}
                />
              )}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            {isOwnProfile && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-32">{t.profile.email}</span>
                <span className="text-sm">{user.email}</span>
              </div>
            )}
            {user.username && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-32">{t.profile.userId}</span>
                <span className="text-sm">{user.username}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-3">
            {isOwnProfile ? "自分の学習セッション" : "学習セッション"}
          </h2>
          {studySessions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {isOwnProfile
                ? "まだ学習セッションがありません"
                : "閲覧可能なセッションがありません"}
            </p>
          ) : (
            <ul className="space-y-2">
              {studySessions.map((s) => (
                <li key={s.id} className="flex items-start justify-between border-b pb-2 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {s.subject || "無題"}
                      </p>
                      {isOwnProfile && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {visibilityLabels[s.visibility] || s.visibility}
                        </span>
                      )}
                    </div>
                    {s.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{s.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(s.startTime).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-medium ml-2 whitespace-nowrap">
                    {formatDuration(s.duration)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
