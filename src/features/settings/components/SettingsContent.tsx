"use client";

import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Key, Clock, Shield } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

export function SettingsContent() {
  const { t } = useTranslations();

  return (
    <div className="container max-w-2xl py-6 space-y-6">
      <h1 className="text-2xl font-bold">{t.settings.title}</h1>

      <div className="space-y-4">
        {/* Appearance Settings Link */}
        <Link href="/settings/appearance" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t.settings.appearance}
              </CardTitle>
              <CardDescription>{t.settings.appearanceDescription}</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* Account Settings Link */}
        <Link href="/settings/account" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t.settings.account}
              </CardTitle>
              <CardDescription>{t.settings.accountDescription}</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* Password Change Link */}
        <Link href="/settings/password" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-5 w-5" />
                パスワード変更
              </CardTitle>
              <CardDescription>パスワードを変更します</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* Login History Link */}
        <Link href="/settings/login-history" className="block">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                ログイン履歴
              </CardTitle>
              <CardDescription>ログイン履歴を確認します</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
