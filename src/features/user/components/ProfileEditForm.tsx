"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfileAction, updateProfileImageAction } from "@/features/user/server/profile-actions";
import { toast } from "sonner";
import { useTranslations } from "@/lib/i18n";

type Props = {
  user: {
    id: string;
    username: string | null;
    name: string | null;
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

export function ProfileEditForm({ user }: Props) {
  const router = useRouter();
  const { update } = useSession();
  const { t } = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user.name ?? "");
  const [username, setUsername] = useState(user.username ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(user.image);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "アップロードに失敗しました");
      }

      const { url } = await response.json();

      const result = await updateProfileImageAction(url);
      if (result.success) {
        setImagePreview(url);
        await update();
        toast.success(t.profile.imageUpdated);
        router.refresh();
      } else {
        toast.error(result.error);
        setImagePreview(user.image);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "アップロードに失敗しました");
      setImagePreview(user.image);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await updateProfileAction({ name, username });
    if (result.success) {
      await update();
      toast.success(t.profile.updated);
      router.push(`/users/${user.id}`);
    } else {
      toast.error(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{t.profile.editTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            className="relative group rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={handleImageClick}
            disabled={isUploading}
          >
            <Avatar className="h-24 w-24 cursor-pointer">
              <AvatarImage src={getImageUrl(imagePreview)} />
              <AvatarFallback className="text-2xl">
                {name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
              aria-hidden="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
            </div>
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleImageChange}
          />
          <p className="text-sm text-muted-foreground">
            {t.profile.imageHelp}
          </p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.profile.nameLabel}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.profile.namePlaceholder}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">{t.profile.userIdLabel}</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.profile.userIdPlaceholder}
              required
            />
            <p className="text-xs text-muted-foreground">
              {t.profile.userIdHelp}
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? t.profile.saving : t.profile.save}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {t.common.cancel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
