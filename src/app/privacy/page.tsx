"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">プライバシーポリシー</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground">最終更新日: 2026年4月11日</p>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-3">1. 収集する情報</h2>
            <p className="mb-2">本サービスでは、以下の情報を収集します：</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>メールアドレス、ユーザー名、パスワード（ハッシュ化して保存）</li>
              <li>OAuth認証を通じて取得するプロフィール情報</li>
              <li>学習時間、科目、進捗などの学習記録データ</li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-3">2. 情報の利用目的</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>アカウントの管理と認証</li>
              <li>学習記録の保存と進捗表示</li>
              <li>サービスの改善と機能開発</li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-3">3. 情報の共有</h2>
            <p>ユーザーの個人情報を第三者に提供することはありません。ただし、法令に基づく場合を除きます。</p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-3">4. データの保護</h2>
            <p>SSL/TLS暗号化通信を使用し、パスワードはハッシュ化して保存します。</p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-3">5. お問い合わせ</h2>
            <p>プライバシーに関するお問い合わせは、サービス内のお問い合わせフォームよりご連絡ください。</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
