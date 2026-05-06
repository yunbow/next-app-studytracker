"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  followUser,
  unfollowUser,
  cancelFollowRequest,
} from "@/features/social/server/social-actions";

type FollowStatus = "none" | "following" | "requested";

type Props = {
  targetUserId: string;
  initialStatus: FollowStatus;
  isPrivate: boolean;
};

export function FollowButton({ targetUserId, initialStatus, isPrivate }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<FollowStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const handleClick = () => {
    startTransition(async () => {
      if (status === "following") {
        const result = await unfollowUser(targetUserId);
        if (result.success) {
          setStatus("none");
          router.refresh();
        } else {
          toast.error(result.error ?? "フォロー解除に失敗しました");
        }
        return;
      }

      if (status === "requested") {
        const result = await cancelFollowRequest(targetUserId);
        if (result.success) {
          setStatus("none");
          router.refresh();
        } else {
          toast.error(result.error ?? "キャンセルに失敗しました");
        }
        return;
      }

      const result = await followUser({ targetUserId });
      if (result.success) {
        setStatus(isPrivate ? "requested" : "following");
        router.refresh();
      } else {
        toast.error(result.error ?? "フォローに失敗しました");
      }
    });
  };

  const label =
    status === "following"
      ? "フォロー中"
      : status === "requested"
        ? "リクエスト済み"
        : "フォローする";

  return (
    <Button
      size="sm"
      variant={status === "none" ? "default" : "outline"}
      disabled={isPending}
      onClick={handleClick}
    >
      {isPending ? "処理中..." : label}
    </Button>
  );
}
