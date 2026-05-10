# StudyTracker

学習時間の記録・可視化・目標管理を行う Web アプリケーションです。タイマーで学習時間を計測し、ダッシュボードで進捗を確認、目標やバッジで継続をサポートします。

## 主な機能

- **タイマー**: ポモドーロや時間計測で学習を記録
- **学習記録**: セッション単位での記録と振り返り
- **ダッシュボード / 分析**: グラフによる学習時間の可視化
- **目標管理**: 期間や科目ごとの目標設定とトラッキング
- **バッジ**: 継続や達成に応じた実績の付与
- **ソーシャル / グループ**: フォロー、リアクション、コメント、グループ学習
- **メンター / リマインダー / 通知**: 学習継続を支える各種サポート機能
- **サブスクリプション**: Free / Basic / Premium プラン (Stripe 連携)
- **認証**: メール+パスワード / Google / GitHub によるログイン

## 技術スタック

| 領域              | 採用技術                                                  |
| ----------------- | --------------------------------------------------------- |
| フレームワーク    | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| 言語              | TypeScript                                                |
| UI                | React 19, Tailwind CSS v4, Radix UI, shadcn/ui            |
| フォーム / 検証   | React Hook Form, Zod                                      |
| 状態 / 取得       | TanStack Query                                            |
| 認証              | NextAuth (Auth.js v5 beta)                                |
| ORM / DB          | Prisma 6 / PostgreSQL (Docker)                            |
| オブジェクトストレージ | Cloudflare R2 (本番) / MinIO (ローカル)                |
| 課金              | Stripe (本番) / stripe-mock (ローカル)                    |
| グラフ            | Recharts                                                  |
| ロギング          | Pino                                                      |
| テスト            | Vitest, Testing Library, Playwright                       |
| Lint / 整形       | ESLint, Prettier                                          |

## ディレクトリ構成

```
.
├─ prisma/              # Prisma スキーマ・マイグレーション
├─ src/
│  ├─ app/              # Next.js App Router (ルーティング)
│  ├─ components/       # 共通 UI コンポーネント
│  ├─ features/         # 機能単位のドメインロジック (timer, goals, social, ...)
│  ├─ lib/              # 認証・i18n・DB クライアント等の共通ロジック
│  ├─ middleware.ts     # Next.js ミドルウェア
│  ├─ tests/            # ユニットテスト
│  └─ types/            # 型定義
├─ tests/e2e/           # Playwright E2E テスト
├─ docs/                # ドキュメント
└─ ...
```

## クイックスタート

サブモジュールを含むため `--recurse-submodules` でクローンしてください。

```bash
# 1. クローン (サブモジュール込み)
git clone --recurse-submodules <REPOSITORY_URL>
cd next-app-studytracker

# 2. 依存関係のインストール
npm install

# 3. 環境変数の用意
cp .env.example .env
# AUTH_SECRET を生成して .env に設定 (32 文字以上)
openssl rand -base64 48

# 4. PostgreSQL / MinIO / stripe-mock を起動
docker compose up -d

# 5. データベースのマイグレーション + 開発用シード投入
npm run db:migrate:dev
npm run db:seed:dev

# 6. 開発サーバー起動
npm run dev
```

ブラウザで <http://localhost:3000> を開いてください。

開発用シード投入後は次のアカウントでログインできます (パスワードは全員 `password123`):

| ユーザー | メール              | プラン  |
| -------- | ------------------- | ------- |
| Alice    | alice@example.com   | premium |
| Bob      | bob@example.com     | free    |
| Charlie  | charlie@example.com | basic   |

詳細な手順・トラブルシューティングは [docs/usages/local-setup.md](docs/usages/local-setup.md) を参照してください。

## スクリプト

| 用途                      | コマンド                       |
| ------------------------- | ------------------------------ |
| 開発サーバー              | `npm run dev`                  |
| 本番ビルド                | `npm run build`                |
| 本番サーバー              | `npm start`                    |
| Lint                      | `npm run lint`                 |
| 型チェック                | `npm run type-check`           |
| フォーマット適用          | `npm run format`               |
| フォーマット確認          | `npm run format:check`         |
| 全テスト (1 回)           | `npm test`                     |
| ユニットテスト            | `npm run test:unit`            |
| インテグレーションテスト  | `npm run test:integration`     |
| テスト (watch)            | `npm run test:watch`           |
| E2E テスト                | `npm run test:e2e`             |
| バンドル解析              | `npm run analyze`              |
| マイグレーション (dev)    | `npm run db:migrate:dev`       |
| マイグレーション (deploy) | `npm run db:migrate:deploy`    |
| マイグレーション状態      | `npm run db:migrate:status`    |
| シード投入 (dev)          | `npm run db:seed:dev`          |
| シード投入 (prod)         | `npm run db:seed:prod`         |
| Prisma Studio             | `npm run prisma:studio`        |
| 静的画像アップロード      | `npm run upload:static`        |

## ドキュメント

- [ローカル環境構築手順](docs/usages/local-setup.md)
- [SECURITY.md](SECURITY.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)

## ライセンス

[MIT License](LICENSE)
