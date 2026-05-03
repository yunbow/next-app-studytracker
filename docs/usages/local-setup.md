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

---

## PostgreSQL 構築・運用手順

このプロジェクトは独立した PostgreSQL コンテナを `docker-compose.yml` で持つ設計です。本プロジェクトの DB は **ホスト側ポート `54339`** で公開されます (他の `next-app-*` プロジェクトとは衝突しないよう個別に割り当て済み)。

### 前提

- **Docker Desktop** が起動していること (`docker version` が通る)
- `.env` に `DATABASE_URL` が入っていること
- `npm install` 完了

### 1. PostgreSQL コンテナを起動

プロジェクトのルートで:

```powershell
docker compose up -d
```

- `-d` でバックグラウンド起動
- 初回はイメージ pull で 1〜2 分かかる
- 2 回目以降は数秒で立ち上がる

起動確認:

```powershell
docker compose ps
```

`STATUS` 列が `Up (healthy)` になっていれば OK (compose の healthcheck で `pg_isready` を見ている)。`(starting)` の間は接続失敗するので、healthy になるまで数秒待つ。

### 2. マイグレーション適用

スキーマを DB に反映 (初回 = テーブル作成、2 回目以降 = 差分適用):

```powershell
npm run db:migrate:dev
```

新しい migration を生成したいときは `--name` を渡す:

```powershell
npm run db:migrate:dev -- --name <name>
```

CI / 本番系では対話処理を伴わない deploy 系を使う:

```powershell
npm run db:migrate:deploy
```

### 3. SEED 投入 (任意)

開発用テストデータを投入:

```powershell
npm run db:seed:dev
```

冪等なので何度実行しても重複しません。

### 4. アプリ起動

```powershell
npm run dev
```

`http://localhost:3000` にアクセスして動作確認。

### 5. データ確認・操作

GUI で中身を見たい場合:

```powershell
npm run prisma:studio
```

`http://localhost:5555` で Prisma Studio が開きます。

CLI で直接 psql に入りたい場合:

```powershell
docker compose exec db psql -U app -d app
```

### ライフサイクル運用

| 操作 | コマンド | 備考 |
| --- | --- | --- |
| 停止 (データ保持) | `docker compose stop` | 次回 `start` で即復帰 |
| 再開 | `docker compose start` | |
| 完全停止＋コンテナ削除 | `docker compose down` | ボリュームは残る |
| **DB を完全リセット** | `docker compose down -v` | ⚠ 全データ消失 |
| ログ追跡 | `docker compose logs -f db` | エラー調査時 |

ハマったときの定番リセット手順:

```powershell
docker compose down -v
docker compose up -d
npm run db:migrate:dev
npm run db:seed:dev
```

### 複数プロジェクトを同時に起動する場合

`docker-compose.yml` の `name:` フィールドが各プロジェクトで異なるため、コンテナは独立して並走できます。ホスト側ポートも 54321〜54342 で固有割当なので衝突しません。

すべて起動するとメモリ消費が積み上がるので、使わないものは `docker compose stop` しておくのが無難です。

全プロジェクトの DB を一覧:

```powershell
docker ps --filter "name=next-app-" --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
```

### トラブルシューティング

| 症状 | 原因 | 対処 |
| --- | --- | --- |
| `port is already allocated` | 該当ポートが他のサービスで使用中 | `docker compose down`、または `netstat -ano \| Select-String "54339"` で犯人を特定 |
| `P1001: Can't reach database server` | コンテナがまだ healthy でない、もしくは `.env` の `DATABASE_URL` のポートと `docker-compose.yml` の publish ポートが不一致 | healthcheck 完了を待つ / `.env` を確認 |
| マイグレーションが破綻 | dev 環境で発生する典型 | `docker compose down -v` で DB をリセットしてから `npm run db:migrate:dev` |
