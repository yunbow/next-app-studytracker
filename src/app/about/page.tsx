"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">このサービスについて</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <section>
            <h2 className="text-xl font-semibold mb-3">サービス概要</h2>
            <p>StudyTrackerは、学習時間の記録・進捗管理ができるプラットフォームです。日々の学習を記録し、科目別の進捗を可視化することで効率的な学習をサポートします。</p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-3">主な機能</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>学習時間の記録とタイマー</li>
              <li>科目・カテゴリ別の進捗管理</li>
              <li>学習統計のグラフ表示</li>
              <li>目標設定と達成状況の確認</li>
              <li>ダークモード・多言語対応</li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-3">技術スタック</h2>
            <p>Next.js / TypeScript / Prisma / Tailwind CSS</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
