"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-2xl p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Cookieポリシー</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground">最終更新日: 2026年4月11日</p>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-3">1. Cookieの使用</h2>
            <p>本サービスでは、ユーザー体験の向上とサービスの適切な運営のためにCookieを使用しています。</p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-3">2. 使用するCookieの種類</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>認証Cookie</strong>：ログイン状態の維持に使用します</li>
              <li><strong>言語設定Cookie</strong>：表示言語の設定を保存します</li>
              <li><strong>テーマCookie</strong>：ダークモード等の表示設定を保存します</li>
              <li><strong>フォントサイズCookie</strong>：文字サイズの設定を保存します</li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-3">3. Cookieの管理</h2>
            <p>ブラウザの設定からCookieを無効にすることができます。ただし、一部の機能が正常に動作しなくなる場合があります。</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
