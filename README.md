# StudyTracker

学習時間の記録・可視化・目標管理を行う Web アプリケーションです。タイマーで学習時間を計測し、ダッシュボードで進捗を確認、目標やバッジで継続をサポートします。

## 主な機能

- **タイマー**: ポモドーロや時間計測で学習を記録
- **学習記録**: セッション単位での記録と振り返り
- **ダッシュボード / 分析**: グラフによる学習時間の可視化
- **目標管理**: 期間や科目ごとの目標設定とトラッキング
- **バッジ**: 継続や達成に応じた実績の付与
- **ソーシャル / グループ**: フォロー、リアクション、グループ学習
- **メンター / リマインダー / 通知**: 学習継続を支える各種サポート機能
- **認証**: メール / Google / GitHub によるログイン

## 技術スタック

| 領域            | 採用技術                                                  |
| --------------- | --------------------------------------------------------- |
| フレームワーク  | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| 言語            | TypeScript                                                |
| UI              | React 19, Tailwind CSS v4, Radix UI, shadcn/ui            |
| フォーム / 検証 | React Hook Form, Zod                                      |
| 状態 / 取得     | TanStack Query                                            |
| 認証            | NextAuth (Auth.js v5 beta)                                |
| ORM / DB        | Prisma 6 / SQLite (開発)                                  |
| グラフ          | Recharts                                                  |
| ロギング        | Pino                                                      |
| テスト          | Vitest, Testing Library, Playwright                       |
| Lint / 整形     | ESLint, Prettier                                          |

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

```bash
# 1. 依存関係のインストール
npm install

# 2. 環境変数の用意
cp .env.example .env
# AUTH_SECRET を生成して .env に設定
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 3. データベースのマイグレーション
npm run db:migrate:dev

# 4. 開発サーバー起動
npm run dev
```

ブラウザで <http://localhost:3000> を開いてください。詳細な手順は [docs/usages/local-setup.md](docs/usages/local-setup.md) を参照してください。

## スクリプト

| 用途                 | コマンド               |
| -------------------- | ---------------------- |
| 開発サーバー         | `npm run dev`          |
| 本番ビルド           | `npm run build`        |
| 本番サーバー         | `npm start`            |
| Lint                 | `npm run lint`         |
| フォーマット適用     | `npm run format`       |
| フォーマット確認     | `npm run format:check` |
| 単体テスト           | `npm test`             |
| 単体テスト (watch)   | `npm run test:watch`   |
| E2E テスト           | `npm run test:e2e`     |
| バンドル解析         | `npm run analyze`      |
| マイグレーション (dev)    | `npm run db:migrate:dev`    |
| マイグレーション (deploy) | `npm run db:migrate:deploy` |
| マイグレーション状態      | `npm run db:migrate:status` |

## ドキュメント

- [ローカル環境構築手順](docs/usages/local-setup.md)
- [SECURITY.md](SECURITY.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)

## ライセンス

[MIT License](LICENSE)
