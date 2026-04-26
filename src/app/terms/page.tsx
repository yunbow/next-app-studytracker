"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">利用規約</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground">最終更新日: 2026年4月11日</p>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-3">第1条（適用）</h2>
            <p>本利用規約（以下「本規約」といいます）は、StudyTracker（以下「本サービス」といいます）の利用条件を定めるものです。ユーザーは、本規約に同意した上で、本サービスを利用するものとします。</p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-3">第2条（定義）</h2>
            <p className="mb-2">本規約において使用する用語の定義は、次のとおりとします。</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>「本サービス」とは、学習時間の記録・進捗管理を行うプラットフォームをいいます。</li>
              <li>「ユーザー」とは、本サービスを利用する全ての方をいいます。</li>
              <li>「登録ユーザー」とは、本サービスに登録を行ったユーザーをいいます。</li>
              <li>「投稿データ」とは、ユーザーが本サービスに記録した学習記録、目標等のデータをいいます。</li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-3">第3条（アカウント）</h2>
            <p>ユーザーは正確な情報を提供してアカウントを作成する必要があります。アカウント情報の管理はユーザー自身の責任で行うものとします。</p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-3">第4条（禁止事項）</h2>
            <p className="mb-2">ユーザーは、以下の行為をしてはなりません。</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>法令または公序良俗に違反する行為</li>
              <li>他のユーザーへの嫌がらせや誹謗中傷</li>
              <li>虚偽の情報を投稿する行為</li>
              <li>サービスの運営を妨害する行為</li>
              <li>不正アクセスやスパム行為</li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-3">第5条（免責事項）</h2>
            <p>本サービスは個人の学習目的で提供されており、商用サービスではありません。本サービスの利用により生じた損害について、運営者は一切の責任を負いません。</p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-3">第6条（お問い合わせ）</h2>
            <p>本規約に関するお問い合わせは、サービス内のお問い合わせフォームよりご連絡ください。</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
