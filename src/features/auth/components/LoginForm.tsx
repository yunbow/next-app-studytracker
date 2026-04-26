"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/use-translations";
import { Github, Mail } from "lucide-react";

export function LoginForm() {
  const { t } = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("ログインに失敗しました");
      } else {
        toast.success("ログインしました");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (error) {
      toast.error("ログインに失敗しました");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.auth.loginTitle}</CardTitle>
        <CardDescription>{t.common.appName}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t.common.email}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t.common.password}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {t.common.login}
          </Button>
        </form>

        <div className="mt-4 space-y-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthSignIn("google")}
          >
            <Mail className="mr-2 h-4 w-4" />
            {t.auth.loginWithGoogle}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthSignIn("github")}
          >
            <Github className="mr-2 h-4 w-4" />
            {t.auth.loginWithGitHub}
          </Button>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t.auth.noAccount}{" "}
          <Link href="/register" className="text-primary hover:underline">
            {t.common.register}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
