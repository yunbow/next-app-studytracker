# ローカル環境構築手順

Next.js + Prisma + NextAuth で構成された StudyTracker のローカル開発環境を構築する手順です。

## 1. 前提条件

以下が事前にインストールされている必要があります。

| ツール       | 推奨バージョン | 備考                                               |
| ------------ | -------------- | -------------------------------------------------- |
| Node.js      | 20.x 以上      | `next@16` 系の動作要件                             |
| npm          | 10.x 以上      | Node.js に同梱                                     |
| Git          | 2.x 以上       | リポジトリのクローンとサブモジュール取得に使用     |
| OS           | Windows / macOS / Linux | Windows では Git Bash または PowerShell を推奨 |

バージョン確認:

```bash
node -v
npm -v
git --version
```

## 2. リポジトリの取得

サブモジュール (`.gitmodules`) を含むため、`--recurse-submodules` を付けてクローンしてください。

```bash
git clone --recurse-submodules <REPOSITORY_URL>
cd next-app-studytracker
```

すでにクローン済みの場合:

```bash
git submodule update --init --recursive
```

## 3. 依存パッケージのインストール

```bash
npm install
```

`postinstall` フックで `prisma generate` が自動実行され、Prisma Client が生成されます。

## 4. 環境変数の設定

`.env.example` を `.env` にコピーして必要な値を埋めます。

```bash
cp .env.example .env
```

| 変数名                                     | 説明                                              | ローカルでの推奨値                  |
| ------------------------------------------ | ------------------------------------------------- | ----------------------------------- |
| `DATABASE_URL`                             | Prisma が参照する DB 接続先 (SQLite ファイル)    | `file:./dev.db`                     |
| `AUTH_SECRET`                              | NextAuth のセッション暗号化キー                   | 下記コマンドで生成                  |
| `AUTH_URL`                                 | アプリの公開 URL                                  | `http://localhost:3000`             |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`    | Google OAuth クライアント情報 (任意)              | OAuth を使うときのみ設定            |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`    | GitHub OAuth クライアント情報 (任意)              | OAuth を使うときのみ設定            |
| `EMAIL_SERVER_*` / `EMAIL_FROM`            | メール認証用 SMTP 設定 (任意)                     | メール機能を使うときのみ設定        |

`AUTH_SECRET` の生成例:

```bash
# OpenSSL がある環境
openssl rand -base64 32

# Node.js のみで生成する場合
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

> OAuth / メール関連の値はローカルで動作確認するだけなら未設定でも構いません。未設定のプロバイダはログイン画面で利用不可となります。

## 5. データベースの初期化

SQLite を使用しているため追加のサーバーは不要です。マイグレーションを適用するだけで `prisma/dev.db` が作成されます。

```bash
npm run db:migrate:dev
```

マイグレーション状態の確認:

```bash
npm run db:migrate:status
```

DB の中身を GUI で確認したい場合:

```bash
npx prisma studio
```

## 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで <http://localhost:3000> を開きます。

## 7. その他の主要コマンド

| 用途                 | コマンド               | 備考                                            |
| -------------------- | ---------------------- | ----------------------------------------------- |
| 本番ビルド           | `npm run build`        |                                                 |
| 本番ビルド起動       | `npm start`            | `build` 後に実行                                |
| Lint                 | `npm run lint`         | ESLint                                          |
| フォーマット適用     | `npm run format`       | Prettier                                        |
| フォーマット確認のみ | `npm run format:check` | CI で利用                                       |
| 単体テスト           | `npm test`             | Vitest (1 回のみ実行)                           |
| 単体テスト (watch)   | `npm run test:watch`   |                                                 |
| E2E テスト           | `npm run test:e2e`     | Playwright。初回は `npx playwright install` が必要 |
| バンドル解析         | `npm run analyze`      | `ANALYZE=true` で `next build` を実行           |

## 8. よくあるトラブル

### `prisma generate` が失敗する

`node_modules` が壊れている可能性があります。

```bash
rm -rf node_modules
npm install
```

### マイグレーションが当たらない / DB がおかしくなった

ローカル DB を初期化したい場合のみ、SQLite ファイルを削除して再適用します (本番では絶対に行わないでください)。

```bash
rm prisma/dev.db
npm run db:migrate:dev
```

### Playwright のテストが Vitest で実行されてエラーになる

`vitest.config.ts` の `test.exclude` に `tests/e2e/**` が含まれていることを確認してください。Playwright のテストは `npm run test:e2e` で実行します。

### ポート 3000 が使用中

別ポートで起動できます。

```bash
npm run dev -- --port 3001
```

その場合は `.env` の `AUTH_URL` も同じポートに合わせてください。
